"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationList } from "@/components/locations/location-list";
import { AddLocationDialog } from "@/components/locations/add-location-dialog";

export default function LocationsPage() {
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddLocationOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Location
          </Button>
        </div>
      </div>
      <LocationList />
      <AddLocationDialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen} />
    </div>
  );
}