import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, MapPin, IndianRupee, Settings2 } from "lucide-react";

interface Region {
  id: string;
  city: string;
  state: string;
}

interface PricingItem {
  id: string;
  service_name: string;
  price: number;
  currency: string;
  description: string | null;
  region_id: string;
}

export function AdminPricingView() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PricingItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("regions")
        .select("id, city, state")
        .eq("is_active", true)
        .order("city");
      if (data && data.length > 0) {
        setRegions(data);
        setSelectedRegion(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedRegion) return;
    fetchPricing();
  }, [selectedRegion]);

  async function fetchPricing() {
    setLoading(true);
    const { data } = await supabase
      .from("region_pricing")
      .select("*")
      .eq("region_id", selectedRegion)
      .order("service_name");
    setPricing(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditItem(null);
    setFormName("");
    setFormPrice("");
    setFormDesc("");
    setDialogOpen(true);
  }

  function openEdit(item: PricingItem) {
    setEditItem(item);
    setFormName(item.service_name);
    setFormPrice(String(item.price));
    setFormDesc(item.description || "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formPrice.trim()) {
      toast.error("Service name and price are required");
      return;
    }
    setSaving(true);

    if (editItem) {
      const { error } = await supabase
        .from("region_pricing")
        .update({
          service_name: formName.trim(),
          price: parseFloat(formPrice),
          description: formDesc.trim() || null,
        })
        .eq("id", editItem.id);

      if (error) toast.error("Failed to update: " + error.message);
      else toast.success("Price updated");
    } else {
      const { error } = await supabase.from("region_pricing").insert({
        region_id: selectedRegion,
        service_name: formName.trim(),
        price: parseFloat(formPrice),
        description: formDesc.trim() || null,
      });

      if (error) toast.error("Failed to add: " + error.message);
      else toast.success("Price added");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchPricing();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("region_pricing").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      fetchPricing();
    }
  }

  const selectedCity = regions.find((r) => r.id === selectedRegion);

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Pricing</h1>
          <p className="text-sm text-muted-foreground">Add or edit service prices per region</p>
        </div>
      </div>

      {/* Region Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRegion(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedRegion === r.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {r.city}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {selectedCity && (
            <span className="text-sm font-medium text-foreground">
              {selectedCity.city} — {pricing.length} services
            </span>
          )}
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Service
        </Button>
      </div>

      {/* Pricing List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : pricing.length === 0 ? (
        <Card variant="glass">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No services added for this region.</p>
            <Button onClick={openAdd} variant="outline" size="sm" className="mt-3">
              <Plus className="w-4 h-4 mr-1" /> Add first service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pricing.map((item) => (
            <Card key={item.id} variant="glass">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">{item.service_name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-foreground">{item.price.toLocaleString("en-IN")}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Service Price" : "Add Service Price"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Service Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Basic Service"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Price (₹ INR)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 500"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Description (optional)</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Brief description of the service"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
