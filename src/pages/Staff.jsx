import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff() {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'PACKER',
        is_active: true,
    });

    useEffect(() => {
        loadStaff();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = staff.filter(s =>
                s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStaff(filtered);
        } else {
            setFilteredStaff(staff);
        }
    }, [searchQuery, staff]);

    const loadStaff = async () => {
        try {
            const data = await window.electronAPI.staff.getAll();
            setStaff(data);
            setFilteredStaff(data);
        } catch (error) {
            console.error('Error loading staff:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Username is required',
                variant: 'destructive',
            });
            return;
        }

        if (!editingStaff && !formData.password.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Password is required for new staff',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.full_name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Full name is required',
                variant: 'destructive',
            });
            return;
        }

        try {
            if (editingStaff) {
                await window.electronAPI.staff.update(editingStaff.id, {
                    username: formData.username,
                    full_name: formData.full_name,
                    role: formData.role,
                    is_active: formData.is_active,
                    password: formData.password, // Only update if provided
                });
                toast({
                    title: 'Success',
                    description: 'Staff member updated successfully',
                });
            } else {
                await window.electronAPI.staff.create({
                    ...formData,
                    password_hash: formData.password,
                });
                toast({
                    title: 'Success',
                    description: 'Staff member created successfully',
                });
            }
            loadStaff();
            setShowDialog(false);
            resetForm();
        } catch (error) {
            console.error('Error saving staff:', error);

            // Check for specific error types
            if (error.message && error.message.includes('UNIQUE constraint failed: staff.username')) {
                toast({
                    title: 'Username Already Exists',
                    description: 'This username is already taken. Please choose a different username.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save staff member',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            try {
                await window.electronAPI.staff.delete(id);
                toast({
                    title: 'Success',
                    description: 'Staff member deleted successfully',
                });
                loadStaff();
            } catch (error) {
                console.error('Error deleting staff:', error);
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to delete staff member',
                    variant: 'destructive',
                });
            }
        }
    };

    const openEditDialog = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            username: staffMember.username,
            password: '',
            full_name: staffMember.full_name,
            role: staffMember.role,
            is_active: staffMember.is_active,
        });
        setShowDialog(true);
    };

    const resetForm = () => {
        setEditingStaff(null);
        setFormData({
            username: '',
            password: '',
            full_name: '',
            role: 'PACKER',
            is_active: true,
        });
    };

    // Check if user has permission to manage staff
    if (!hasPermission('manage_staff')) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">You don't have permission to manage staff.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { activePlan } = useAuth();
    if (activePlan === 'STARTER') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-6 text-center px-4">
                <div className="bg-primary/10 p-6 rounded-full">
                    <UsersIcon className="w-16 h-16 text-primary" />
                </div>
                <div className="max-w-md space-y-2">
                    <h1 className="text-3xl font-bold">Multiple Staff Accounts</h1>
                    <p className="text-lg text-muted-foreground">
                        Scale your operations by adding staff members, assigning roles, and tracking individual performance.
                    </p>
                </div>

                <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pro Plan Feature</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="text-sm text-left space-y-2 mb-4">
                            <li className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-green-500/10 border-green-500/50 text-green-600">✓</Badge>
                                <span>Unlimited Staff Members</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-green-500/10 border-green-500/50 text-green-600">✓</Badge>
                                <span>Role-Based Access Control</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-green-500/10 border-green-500/50 text-green-600">✓</Badge>
                                <span>Staff Activity Logs</span>
                            </li>
                        </ul>
                        <Button className="w-full" asChild>
                            <a href="/pricing">Upgrade to Pro</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
                    <p className="text-muted-foreground">Manage staff accounts and roles</p>
                </div>
                <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Staff
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search staff by name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No staff members found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((staffMember) => (
                                    <TableRow key={staffMember.id}>
                                        <TableCell className="font-mono">{staffMember.username}</TableCell>
                                        <TableCell className="font-medium">{staffMember.full_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={staffMember.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {staffMember.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={staffMember.is_active ? 'default' : 'destructive'}>
                                                {staffMember.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {staffMember.last_login ? formatDateTime(staffMember.last_login) : 'Never'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(staffMember)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(staffMember.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                        <DialogDescription>Fill in the staff member details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="username"
                                />
                            </div>
                            {!editingStaff && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <Input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="password"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="PACKER">Packer</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingStaff ? 'Update Staff' : 'Create Staff'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
