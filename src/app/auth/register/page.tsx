import RegistrationWizard from "@/components/forms/RegistrationWizard";

export default function RegisterPage() {
  return (
    // Keeping your exact layout so the Wizard takes full screen
    <main className="w-full min-h-screen bg-stone-50">
      <RegistrationWizard />
    </main>
  );
}