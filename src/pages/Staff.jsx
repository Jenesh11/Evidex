import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users as UsersIcon, UserCog, UserCheck, Shield, Key, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
            if (!searchQuery) setFilteredStaff(data);
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

    // Helper for initials
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Check if user has permission to manage staff
    if (!hasPermission('manage_staff')) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-md border-destructive/20 bg-destructive/5">
                    <CardContent className="p-8 text-center">
                        <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-destructive">Access Denied</h2>
                        <p className="text-muted-foreground">You don't have permission to manage staff settings.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { activePlan } = useAuth();
    if (activePlan === 'STARTER') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-6 text-center px-4">
                <div className="bg-primary/10 p-6 rounded-full ring-4 ring-primary/5">
                    <UsersIcon className="w-16 h-16 text-primary" />
                </div>
                <div className="max-w-md space-y-2">
                    <h1 className="text-3xl font-bold">Multiple Staff Accounts</h1>
                    <p className="text-lg text-muted-foreground">
                        Scale your operations by adding staff members, assigning roles, and tracking individual performance.
                    </p>
                </div>

                <Card className="w-full max-w-sm border-2 border-primary/20 shadow-xl bg-card/50 backdrop-blur">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pro Plan Feature</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="text-sm text-left space-y-3 mb-4">
                            <li className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <span className="text-green-600 text-xs font-bold">✓</span>
                                </div>
                                <span className="font-medium">Unlimited Staff Members</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <span className="text-green-600 text-xs font-bold">✓</span>
                                </div>
                                <span className="font-medium">Role-Based Access Control</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <span className="text-green-600 text-xs font-bold">✓</span>
                                </div>
                                <span className="font-medium">Staff Activity Logs</span>
                            </li>
                        </ul>
                        <Button className="w-full shadow-md" size="lg" asChild>
                            <a href="/pricing">Upgrade to Pro</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Stats
    const activeStaffCount = staff.filter(s => s.is_active).length;
    const adminCount = staff.filter(s => s.role === 'ADMIN').length;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Staff Management</h1>
                    <p className="text-muted-foreground">Manage your team's access and roles</p>
                </div>
                <Button size="lg" onClick={() => { resetForm(); setShowDialog(true); }} className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Staff
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <UsersIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                            <h3 className="text-2xl font-bold">{staff.length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/10 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-full">
                            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{activeStaffCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/10 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Admins</p>
                            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{adminCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search staff by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-background shadow-sm rounded-full"
                />
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed">
                        <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                            <UsersIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            {searchQuery ? "Try adjusting your search terms." : "Get started by adding your first staff member."}
                        </p>
                        <Button variant="outline" onClick={() => { resetForm(); setShowDialog(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Staff
                        </Button>
                    </div>
                ) : (
                    filteredStaff.map((staffMember) => (
                        <Card key={staffMember.id} className="group hover:shadow-md transition-all duration-200 overflow-hidden border-border/60">
                            <div className={`h-2 w-full ${staffMember.is_active ? 'bg-green-500' : 'bg-muted'}`} />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {getInitials(staffMember.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-lg line-clamp-1">{staffMember.full_name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                @{staffMember.username}
                                                {staffMember.role === 'ADMIN' && (
                                                    <Shield className="w-3 h-3 text-blue-500 fill-blue-500/20" />
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditDialog(staffMember)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(staffMember.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remove Staff
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Role</span>
                                        <Badge variant="outline" className="uppercase text-xs font-semibold">
                                            {staffMember.role}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={staffMember.is_active ? 'default' : 'secondary'} className={staffMember.is_active ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400' : ''}>
                                            {staffMember.is_active ? 'Active' : 'Deactivated'}
                                        </Badge>
                                    </div>
                                    <div className="pt-3 mt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                                        <span>Last Login</span>
                                        <span>{staffMember.last_login ? formatDateTime(staffMember.last_login).split(',')[0] : 'Never'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{editingStaff ? 'Edit Profile' : 'New Staff Member'}</DialogTitle>
                        <DialogDescription>
                            {editingStaff ? 'Update account details and permissions.' : 'Create a new account for your team member.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Username</label>
                                    <Input
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="jdoe"
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="PACKER">Packer</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                    className="bg-muted/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between">
                                    Password
                                    {!editingStaff && <span className="text-destructive">*</span>}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        required={!editingStaff}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingStaff ? "Leave blank to keep current" : "Set secure password"}
                                        className="pl-9 bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium cursor-pointer select-none flex-1">
                                    Account Active
                                </label>
                                <Badge variant={formData.is_active ? 'outline' : 'destructive'}>
                                    {formData.is_active ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="min-w-[100px]">
                                {editingStaff ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
