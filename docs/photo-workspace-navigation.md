# Photo Workspace navigation

The original Image Management and Approval Thread screens were tested with sample photos and were never adopted as the staff's official upload process. Photo Workspace replaces them in the dashboard navigation.

The sidebar and dashboard no longer expose or render either original image screen. Old sample-image notifications open Photo Workspace when the current staff member has a photo review assignment; otherwise they return to Graduate Masterlist. A legacy image ID is not treated as a new photo review ID. This change grants no additional permissions.

The stored sample photos, old comments, database tables and backend endpoints are preserved. Their later removal would be a separate cleanup after Koi's review. Other dashboard features and the new QC/moderator flow are unchanged.

Before release, staff who need the new photo workflow must receive the corresponding review assignments. The old image-approver flag does not grant new review permissions.

Staff Management no longer offers the old Image Approver checkbox or sends updates to that legacy flag. Ordinary staff role changes and their password confirmation remain available. Existing flags are retained in the database; this UI change does not clear or convert them.
