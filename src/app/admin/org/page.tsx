import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CreateLocationDialog,
  EditLocationDialog,
  DeleteLocationButton,
} from "@/components/admin/org/location-dialog";
import {
  CreateUserDialog,
  EditUserDialog,
  DeleteUserButton,
} from "@/components/admin/org/user-dialog";

export default async function OrgPage() {
  await requireRole("CORPORATE");

  const [regions, districts, locations, users] = await Promise.all([
    prisma.region.findMany({
      include: { districts: { include: { locations: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.district.findMany({
      include: { region: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      include: { district: { include: { region: { select: { name: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      include: {
        region: { select: { name: true } },
        district: { select: { name: true } },
        location: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const districtOptions = districts.map((d) => ({ id: d.id, name: d.name }));
  const locationOptions = locations.map((l) => ({ id: l.id, name: l.name }));
  const regionOptions = regions.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Organization</h1>
        <p className="text-sm text-muted-foreground">
          Manage your org tree, shop locations, and admin users.
        </p>
      </div>

      <Tabs defaultValue="locations">
        <TabsList aria-label="Organization sections">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="org-tree">Org Tree</TabsTrigger>
        </TabsList>

        {/* ---- LOCATIONS ---- */}
        <TabsContent value="locations" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Locations</h2>
            <CreateLocationDialog districts={districtOptions} />
          </div>
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No locations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell>{loc.city}</TableCell>
                      <TableCell>{loc.state}</TableCell>
                      <TableCell>{loc.district.name}</TableCell>
                      <TableCell>{loc.district.region.name}</TableCell>
                      <TableCell className="text-muted-foreground">{loc.phone ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <EditLocationDialog
                          location={{
                            id: loc.id,
                            name: loc.name,
                            city: loc.city,
                            state: loc.state,
                            address: loc.address,
                            zip: loc.zip,
                            phone: loc.phone,
                            districtId: loc.districtId,
                          }}
                        />
                        <DeleteLocationButton id={loc.id} name={loc.name} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ---- USERS ---- */}
        <TabsContent value="users" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Admin Users</h2>
            <CreateUserDialog
              regions={regionOptions}
              districts={districtOptions}
              locations={locationOptions}
            />
          </div>
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const scope =
                      u.role === "CORPORATE"
                        ? "All locations"
                        : u.role === "REGIONAL"
                          ? u.region?.name ?? "—"
                          : u.role === "DISTRICT"
                            ? u.district?.name ?? "—"
                            : u.location?.name ?? "—";
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {ROLE_LABELS[u.role as Role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {scope}
                        </TableCell>
                        <TableCell className="text-right">
                          <EditUserDialog
                            user={{
                              id: u.id,
                              name: u.name,
                              email: u.email,
                              role: u.role,
                              regionId: u.regionId,
                              districtId: u.districtId,
                              locationId: u.locationId,
                            }}
                            regions={regionOptions}
                            districts={districtOptions}
                            locations={locationOptions}
                          />
                          <DeleteUserButton id={u.id} name={u.name} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ---- ORG TREE ---- */}
        <TabsContent value="org-tree" className="mt-4">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-heading text-lg font-semibold mb-4">Org Tree</h2>
            <ul className="space-y-4">
              {regions.map((region) => (
                <li key={region.id} className="rounded-lg border p-3">
                  <p className="font-semibold text-sm">{region.name}</p>
                  {region.districts.length > 0 && (
                    <ul className="mt-2 space-y-2 pl-4">
                      {region.districts.map((district) => (
                        <li key={district.id}>
                          <p className="text-sm font-medium text-muted-foreground">
                            {district.name}
                          </p>
                          {district.locations.length > 0 && (
                            <ul className="mt-1 space-y-1 pl-4">
                              {district.locations.map((loc) => (
                                <li
                                  key={loc.id}
                                  className="text-sm text-muted-foreground"
                                >
                                  {loc.name} — {loc.city}, {loc.state}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {regions.length === 0 && (
                <li className="text-center text-muted-foreground py-8">
                  No org structure defined yet.
                </li>
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
