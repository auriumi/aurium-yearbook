//Auth Module (Login)
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

const LOGIN_LIMIT_PREFIX = "aurium:login-limit:v1";
const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_MIN_GAP_MS = 4 * 1000;
const LOGIN_ACCOUNT_MAX_ATTEMPTS = 3;
const LOGIN_DEVICE_MAX_ATTEMPTS = 8;
const LOGIN_SERVER_COOLDOWN_MS = 5 * 60 * 1000;

type LoginLimitState = {
    attempts: number[];
    lockedUntil?: number;
    lastAttemptAt?: number;
};

function canUseLoginStorage() {
    try {
        return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    } catch {
        return false;
    }
}

function readLoginLimitState(key: string): LoginLimitState {
    if (!canUseLoginStorage()) return { attempts: [] };

    try {
        const rawState = window.localStorage.getItem(key);
        if (!rawState) return { attempts: [] };

        const parsed = JSON.parse(rawState) as Partial<LoginLimitState>;
        return {
            attempts: Array.isArray(parsed.attempts)
                ? parsed.attempts.filter((attempt) => Number.isFinite(attempt))
                : [],
            lockedUntil: Number.isFinite(parsed.lockedUntil) ? parsed.lockedUntil : undefined,
            lastAttemptAt: Number.isFinite(parsed.lastAttemptAt) ? parsed.lastAttemptAt : undefined,
        };
    } catch {
        return { attempts: [] };
    }
}

function writeLoginLimitState(key: string, state: LoginLimitState) {
    if (!canUseLoginStorage()) return;
    try {
        window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
        // If storage is blocked/full, let the backend limiter remain the source of truth.
    }
}

function clearLoginLimitState(key: string) {
    if (!canUseLoginStorage()) return;
    try {
        window.localStorage.removeItem(key);
    } catch {
        // Ignore storage cleanup failures.
    }
}

function normalizeLoginId(id: string, isAdmin?: boolean) {
    const trimmedId = id.trim();
    return isAdmin ? trimmedId.toLowerCase() : trimmedId;
}

function hashLoginId(id: string) {
    let hash = 5381;

    for (let index = 0; index < id.length; index += 1) {
        hash = ((hash << 5) + hash) ^ id.charCodeAt(index);
    }

    return (hash >>> 0).toString(36);
}

function loginLimitKeys(id: string, isAdmin?: boolean) {
    const role = isAdmin ? "admin" : "student";
    const accountKey = hashLoginId(normalizeLoginId(id, isAdmin));

    return {
        account: `${LOGIN_LIMIT_PREFIX}:${role}:${accountKey}`,
        device: `${LOGIN_LIMIT_PREFIX}:device`,
    };
}

function formatWaitTime(waitMs: number) {
    const seconds = Math.max(1, Math.ceil(waitMs / 1000));
    if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;

    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function evaluateLoginLimitState(
    key: string,
    maxAttempts: number,
    now: number
): { allowed: true; state: LoginLimitState } | { allowed: false; waitMs: number } {
    const state = readLoginLimitState(key);

    if (state.lockedUntil && state.lockedUntil > now) {
        return { allowed: false, waitMs: state.lockedUntil - now };
    }

    const recentAttempts = state.attempts.filter((attempt) => now - attempt < LOGIN_WINDOW_MS);
    const lastAttemptAt = state.lastAttemptAt ?? 0;

    if (lastAttemptAt && now - lastAttemptAt < LOGIN_MIN_GAP_MS) {
        return { allowed: false, waitMs: LOGIN_MIN_GAP_MS - (now - lastAttemptAt) };
    }

    if (recentAttempts.length >= maxAttempts) {
        const waitMs = LOGIN_WINDOW_MS - (now - recentAttempts[0]);
        return { allowed: false, waitMs };
    }

    return {
        allowed: true,
        state: {
            attempts: recentAttempts,
            lockedUntil: state.lockedUntil && state.lockedUntil > now ? state.lockedUntil : undefined,
            lastAttemptAt,
        },
    };
}

function checkLoginLimit(id: string, isAdmin?: boolean) {
    const now = Date.now();
    const keys = loginLimitKeys(id, isAdmin);
    const accountLimit = evaluateLoginLimitState(keys.account, LOGIN_ACCOUNT_MAX_ATTEMPTS, now);
    if (!accountLimit.allowed) return accountLimit;

    const deviceLimit = evaluateLoginLimitState(keys.device, LOGIN_DEVICE_MAX_ATTEMPTS, now);
    if (!deviceLimit.allowed) return deviceLimit;

    return { allowed: true as const, now, keys, accountState: accountLimit.state, deviceState: deviceLimit.state };
}

function recordLoginAttempt(id: string, isAdmin?: boolean) {
    const limit = checkLoginLimit(id, isAdmin);
    if (!limit.allowed) {
        return {
            allowed: false as const,
            reason: `Please wait ${formatWaitTime(limit.waitMs)} before trying again.`,
        };
    }

    writeLoginLimitState(limit.keys.account, {
        ...limit.accountState,
        attempts: [...limit.accountState.attempts, limit.now],
        lastAttemptAt: limit.now,
    });
    writeLoginLimitState(limit.keys.device, {
        ...limit.deviceState,
        attempts: [...limit.deviceState.attempts, limit.now],
        lastAttemptAt: limit.now,
    });

    return { allowed: true as const };
}

function clearLoginAttempts(id: string, isAdmin?: boolean) {
    const keys = loginLimitKeys(id, isAdmin);
    clearLoginLimitState(keys.account);
}

function recordServerLoginLimit(id: string, isAdmin?: boolean) {
    const now = Date.now();
    const keys = loginLimitKeys(id, isAdmin);
    const lockedUntil = now + LOGIN_SERVER_COOLDOWN_MS;

    writeLoginLimitState(keys.account, {
        ...readLoginLimitState(keys.account),
        lockedUntil,
    });
    writeLoginLimitState(keys.device, {
        ...readLoginLimitState(keys.device),
        lockedUntil,
    });
}

export async function handleLogin(id: string, pass: string, captcha_token: string, is_admin?: boolean) {
    const loginAttempt = recordLoginAttempt(id, is_admin);
    if (!loginAttempt.allowed) {
        return {
            success: false,
            reason: loginAttempt.reason,
        };
    }

    try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: id,
                pass: pass,
                is_admin: is_admin ? is_admin : false,
                captcha_token,
            }),
            credentials: 'include',
        });

        if (!res.ok) {
            if (res.status == 401) {
                return {
                    success: false,
                    reason: "Invalid credentials. Please check your information!"
                }
            } 

            if (res.status == 429) {
                recordServerLoginLimit(id, is_admin);
                return {
                    success: false,
                    reason: "Too many login attempts, please try again later!"
                }
            } 

            return {
                success: false,
                reason: "Something went wrong in the server."
            }
        }

        const body = await res.json();
        clearLoginAttempts(id, is_admin);
        return {
            success: true,
            reason: "Succesfully logged in!",
            is_new: body.is_new
        }

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment. Please try agian later"
        }
    }
};

export async function handleUpdatePass(new_pass: string) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                new_pass: new_pass,
            }),
            credentials: 'include',
        }); 

        if (!res.ok) {
            return {
                success: false,
                reason: "Something went wrong in the server"
            }
        }

        return {
            success: true,
            reason: "Password has been updated succesfully!"
        }

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment. Please try agian later"
        }
    }
};
