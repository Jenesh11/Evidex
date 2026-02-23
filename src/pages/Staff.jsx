import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users as UsersIcon, UserCog, UserCheck, Shield, Key, MoreVertical, LayoutGrid, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const Staff = () => {
    const { user, hasPermission, activePlan } = useAuth();
    const { toast } = useToast();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'PACKER',
        is_active: true
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.staff.getAll();
            setStaff(data);
        } catch (error) {
            console.error('Failed to load staff:', error);
            toast({
                title: "Error",
                description: "Failed to load staff list",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await window.electronAPI.staff.update(editingStaff.id, formData);
                toast({ title: "Success", description: "Staff member updated successfully" });
            } else {
                await window.electronAPI.staff.create(formData);
                toast({ title: "Success", description: "New staff member added" });
            }
            setShowDialog(false);
            resetForm();
            loadStaff();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to save staff member",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await window.electronAPI.staff.delete(id);
            toast({ title: "Success", description: "Staff member removed" });
            loadStaff();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove staff member",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            full_name: '',
            role: 'PACKER',
            is_active: true
        });
        setEditingStaff(null);
    };

    const openEditDialog = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            username: staffMember.username,
            password: '',
            full_name: staffMember.full_name,
            role: staffMember.role,
            is_active: staffMember.is_active === 1 || staffMember.is_active === true
        });
        setShowDialog(true);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const filteredStaff = staff.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeStaffCount = staff.filter(s => s.is_active).length;
    const adminCount = staff.filter(s => s.role === 'ADMIN').length;

    if (!hasPermission('manage_staff')) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="glass-card max-w-md p-10 text-center border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Shield className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 text-foreground dark:text-white tracking-tighter">Security Lock</h2>
                    <p className="text-muted-foreground italic">Administrative privileges are required to manage organizational units.</p>
                </div>
            </div>
        );
    }

    if (activePlan === 'STARTER') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-10 text-center px-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="glass shadow-2xl p-10 rounded-[3rem] border-white/10 relative">
                        <UsersIcon className="w-24 h-24 text-primary" />
                    </div>
                </div>

                <div className="max-w-lg space-y-3">
                    <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white font-display">Personnel Grid</h1>
                    <p className="text-xl text-muted-foreground italic">
                        Scale your operations by adding staff members and assigning specialized operational roles.
                    </p>
                </div>

                <div className="w-full max-w-md glass-card p-10 border-primary/20 bg-primary/5 shadow-2xl rounded-[2.5rem]">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-8 underline decoration-4 underline-offset-8">Standard Feature</h3>
                    <ul className="space-y-6 mb-10">
                        <li className="flex items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary text-sm font-black">✓</span>
                            </div>
                            <span className="font-bold text-foreground dark:text-white/80">Unlimited Team Members</span>
                        </li>
                        <li className="flex items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary text-sm font-black">✓</span>
                            </div>
                            <span className="font-bold text-foreground dark:text-white/80">Advanced Permission Control</span>
                        </li>
                        <li className="flex items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary text-sm font-black">✓</span>
                            </div>
                            <span className="font-bold text-foreground dark:text-white/80">Individual Activity Mapping</span>
                        </li>
                    </ul>
                    <Button className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] btn-pro-primary" asChild>
                        <a href="/pricing">Upgrade to Standard</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 text-foreground dark:text-white font-display">Command Center</h1>
                    <p className="text-muted-foreground text-lg italic">Strategic team coordination & permission management</p>
                </div>
                <Button onClick={() => { resetForm(); setShowDialog(true); }} className="h-14 px-8 rounded-2xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] btn-pro-primary font-black uppercase tracking-widest text-sm">
                    <Plus className="w-5 h-5 mr-3" />
                    Onboard Lead
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 border-white/5 group hover:border-primary/20 transition-all duration-500">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <UsersIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40 mb-1">Fleet Strength</p>
                            <h3 className="text-3xl font-black text-foreground dark:text-white font-display tracking-tight">{staff.length} Members</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 border-white/5 group hover:border-emerald-500/20 transition-all duration-500">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <UserCheck className="w-7 h-7 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40 mb-1">Active Status</p>
                            <h3 className="text-3xl font-black text-emerald-500 font-display tracking-tight">{activeStaffCount} Online</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 border-white/5 group hover:border-blue-500/20 transition-all duration-500">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <Shield className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40 mb-1">Authority Level</p>
                            <h3 className="text-3xl font-black text-blue-500 font-display tracking-tight">{adminCount} Admins</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/20" />
                    <Input
                        placeholder="Intercept signal: Name, Username, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-background/50 backdrop-blur-md shadow-xl rounded-2xl border-white/10 dark:text-white font-bold"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-accent/30 dark:bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 shadow-sm"><LayoutGrid className="w-5 h-5 text-primary" /></Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-muted-foreground"><ListFilter className="w-5 h-5" /></Button>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredStaff.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-32 text-center glass-card border-dashed border-2 m-4"
                        >
                            <div className="mx-auto w-24 h-24 bg-accent/30 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <UsersIcon className="w-10 h-10 text-muted-foreground opacity-30" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tighter mb-2">Zero Signals Found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto italic mb-8">
                                {searchQuery ? "No team members matching your current intercept parameters." : "No organizational data found. Initiate onboarding."}
                            </p>
                            <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10" onClick={() => { resetForm(); setShowDialog(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Begin Onboarding
                            </Button>
                        </motion.div>
                    ) : (
                        filteredStaff.map((staffMember, index) => (
                            <motion.div
                                key={staffMember.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative"
                            >
                                <div className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-500">
                                    <div className={cn(
                                        "h-2 w-full absolute top-0 left-0",
                                        staffMember.is_active ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-muted'
                                    )} />
                                    <div className="p-8 pt-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <Avatar className="h-20 w-20 border-4 border-background dark:border-white/10 shadow-2xl">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl font-display">
                                                            {getInitials(staffMember.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {staffMember.is_active && (
                                                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-background dark:border-white/10" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl text-foreground dark:text-white tracking-tighter font-display leading-tight">{staffMember.full_name}</h3>
                                                    <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                        <span className="opacity-40 font-mono">ID</span> @{staffMember.username}
                                                        {staffMember.role === 'ADMIN' && (
                                                            <div className="ml-2 w-5 h-5 bg-blue-500/10 rounded-md flex items-center justify-center border border-blue-500/20 inline-flex">
                                                                <Shield className="w-3 h-3 text-blue-500" />
                                                            </div>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white/10 rounded-xl">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-card border-white/10 p-2 min-w-[180px]">
                                                    <DropdownMenuItem onClick={() => openEditDialog(staffMember)} className="h-12 rounded-lg cursor-pointer font-bold">
                                                        <Edit className="w-4 h-4 mr-3 text-primary" />
                                                        Profile Override
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(staffMember.id)}
                                                        className="h-12 rounded-lg cursor-pointer text-red-500 focus:text-red-500 font-bold"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                        Terminate Access
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/20">Operational Role</span>
                                                <div className="px-3 py-1 rounded-lg bg-accent/30 dark:bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-foreground dark:text-white">
                                                    {staffMember.role}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/20">Network Status</span>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                                                    staffMember.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-muted/10 text-muted-foreground border-white/5'
                                                )}>
                                                    {staffMember.is_active ? 'Auth Active' : 'Suspended'}
                                                </div>
                                            </div>
                                            <div className="pt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground dark:text-white/20 tracking-widest">
                                                <span className="uppercase">Last Signal</span>
                                                <span className="font-mono">{staffMember.last_login ? formatDateTime(staffMember.last_login).split(',')[0] : 'NEVER'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[425px] glass-card p-0 overflow-hidden border-white/10 ring-0 outline-none">
                    <div className="bg-primary shadow-[0_0_50px_rgba(var(--primary),0.3)] h-2 w-full absolute top-0 left-0 z-50 transition-all duration-1000 group-hover:h-3" />
                    <div className="p-8">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-black tracking-tighter font-display text-foreground dark:text-white">
                                {editingStaff ? 'Intercept & Override' : 'New Tactical Unit'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground italic font-medium">
                                {editingStaff ? 'Modifying unit parameters and operational roles.' : 'Initializing new team member into the grid.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 py-2">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Signal ID</label>
                                        <Input
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="jdoe"
                                            className="h-12 bg-accent/30 dark:bg-white/5 border-white/10 rounded-xl font-bold font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Authority</label>
                                        <select
                                            className="w-full h-12 rounded-xl border border-white/10 bg-accent/30 dark:bg-white/5 px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="PACKER" className="bg-background">Packer</option>
                                            <option value="ADMIN" className="bg-background">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
                                    <Input
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="John Doe"
                                        className="h-12 bg-accent/30 dark:bg-white/5 border-white/10 rounded-xl font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center justify-between">
                                        Access Key
                                        {!editingStaff && <span className="text-primary">*</span>}
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/50 font-black" />
                                        <Input
                                            type="password"
                                            required={!editingStaff}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={editingStaff ? "Leave blank to keep current" : "Encryption required"}
                                            className="pl-11 h-12 bg-accent/30 dark:bg-white/5 border-white/10 rounded-xl font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-accent/30 dark:bg-white/5 group/toggle cursor-pointer transition-all hover:bg-accent/50" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                    <div className={cn(
                                        "w-12 h-6 rounded-full p-1 transition-all duration-500",
                                        formData.is_active ? 'bg-emerald-500' : 'bg-muted'
                                    )}>
                                        <div className={cn(
                                            "w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-500",
                                            formData.is_active ? 'translate-x-6' : 'translate-x-0'
                                        )} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-black uppercase tracking-widest cursor-pointer select-none text-foreground dark:text-white/80">
                                            Operational Status
                                        </label>
                                    </div>
                                    <Badge className={cn(
                                        "px-3 py-1 font-black",
                                        formData.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                                    )}>
                                        {formData.is_active ? 'Ready' : 'Locked'}
                                    </Badge>
                                </div>
                            </div>
                            <DialogFooter className="pt-6 gap-3">
                                <Button type="button" variant="ghost" onClick={() => setShowDialog(false)} className="h-12 px-6 font-bold hover:bg-white/5 rounded-xl">
                                    Abort
                                </Button>
                                <Button type="submit" className="h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_10px_30px_rgba(var(--primary),0.2)] btn-pro-primary flex-1">
                                    {editingStaff ? 'Override Profile' : 'Authorize Lead'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Staff;
