import { MapPin } from "lucide-react";
import { Button, Card, IconTile } from "./ui/Primitives";

export function LocationPermissionPrompt({ onAllow, onDecline }: { onAllow: () => void; onDecline: () => void }) {
  return (
    <Card className="flex flex-col items-start gap-3" role="region" aria-labelledby="location-prompt-heading">
      <IconTile tone="info">
        <MapPin size={18} aria-hidden="true" />
      </IconTile>
      <div>
        <h2 id="location-prompt-heading" className="text-sm font-semibold text-white">
          Use your location?
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Use your location to get walking guidance, nearby campus information, and estimated arrival times. Beacon
          works fine without it too — you can always choose a starting point instead.
        </p>
      </div>
      <div className="flex w-full gap-2">
        <Button tone="primary" className="flex-1" onClick={onAllow}>
          Use My Location
        </Button>
        <Button tone="secondary" className="flex-1" onClick={onDecline}>
          Not Now
        </Button>
      </div>
    </Card>
  );
}
