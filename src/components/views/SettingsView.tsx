import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Vibrate, 
  Shield, 
  HelpCircle, 
  FileText,
  ChevronRight,
  Smartphone,
  Cloud,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsGroups = [
  {
    title: "Notifications",
    items: [
      { id: "alerts", icon: Bell, label: "Push Alerts", description: "Get notified of critical changes", hasSwitch: true, enabled: true },
      { id: "vibrate", icon: Vibrate, label: "Haptic Feedback", description: "Vibration during scans", hasSwitch: true, enabled: true },
    ],
  },
  {
    title: "Data & Sync",
    items: [
      { id: "cloud", icon: Cloud, label: "Cloud Sync", description: "Backup scans to cloud", hasSwitch: true, enabled: false },
      { id: "sensors", icon: Smartphone, label: "Sensor Calibration", description: "Calibrate device sensors" },
    ],
  },
  {
    title: "About",
    items: [
      { id: "privacy", icon: Shield, label: "Privacy Policy", description: "How we handle your data" },
      { id: "terms", icon: FileText, label: "Terms of Service", description: "Usage terms and conditions" },
      { id: "help", icon: HelpCircle, label: "Help & Support", description: "FAQs and contact us" },
      { id: "about", icon: Info, label: "About StructuraScan", description: "Version 1.0.0" },
    ],
  },
];

export function SettingsView() {
  return (
    <div className="min-h-screen pb-24 px-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize your StructuraScan experience
        </p>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div
            key={group.title}
            className="animate-fade-in"
            style={{ animationDelay: `${groupIndex * 0.1}s` }}
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              {group.title}
            </h2>
            <Card variant="default">
              <CardContent className="p-0 divide-y divide-border">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors",
                      !item.hasSwitch && "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    <div className="p-2.5 rounded-xl bg-muted">
                      <item.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                    {item.hasSwitch ? (
                      <Switch defaultChecked={item.enabled} />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <p>StructuraScan v1.0.0</p>
        <p className="mt-1">© 2024 All rights reserved</p>
      </div>
    </div>
  );
}
