import React, { useEffect, useState } from 'react';
import { FileText, Search, Filter, Calendar, User, Activity, ScrollText, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const ACTION_LABELS = {
    'ORDER_PACKED': 'Order Packed',
    'VIDEO_RECORDED': 'Video Recorded',
    'RETURN_CREATED': 'Return Created',
    'RETURN_APPROVED': 'Return Approved',
    'RETURN_REJECTED': 'Return Rejected',
    'INVENTORY_RECONCILED': 'Inventory Reconciled',
    'EVIDENCE_EXPORTED': 'Evidence Exported',
    'STAFF_CREATED': 'Staff Created',
    'STAFF_ROLE_CHANGED': 'Role Changed',
    'STAFF_DEACTIVATED': 'Staff Deactivated',
    'UPDATE_RETURN_STATUS': 'Return Status Updated',
    'INVENTORY_DEDUCT': 'Inventory Deducted',
    'CREATE': 'Created',
    'UPDATE': 'Updated',
    'DELETE': 'Deleted',
};

export default function ActivityLogs() {
    const { user, profile } = useAuth();
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: '7days',
        staff_id: null,
        action: null,
        searchQuery: ''
    });

    useEffect(() => {
        loadUsers();
        loadLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [logs, filters]);

    const loadUsers = async () => {
        try {
            const allUsers = await window.electronAPI.staff.getAll();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const allLogs = await window.electronAPI.audit.getLogs({
                dateRange: filters.dateRange,
                staff_id: filters.staff_id,
                action: filters.action
            });
            setLogs(allLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            dateRange: '7days',
            staff_id: null,
            action: null,
            searchQuery: ''
        });
        // Need to reload logs for date range reset
        window.electronAPI.audit.getLogs({
            dateRange: '7days',
            staff_id: null,
            action: null
        }).then(setLogs).catch(console.error);
    };

    const applyFilters = () => {
        let filtered = [...logs];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                log.action?.toLowerCase().includes(query) ||
                log.entity_type?.toLowerCase().includes(query) ||
                log.staff_name?.toLowerCase().includes(query) ||
                log.details?.toLowerCase().includes(query)
            );
        }

        setFilteredLogs(filtered);
    };

    const getActionLabel = (action) => {
        return ACTION_LABELS[action] || action;
    };

    const getActionColor = (action) => {
        if (action?.includes('CREATE') || action?.includes('APPROVED') || action?.includes('PACKED')) {
            return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
        }
        if (action?.includes('DELETE') || action?.includes('REJECTED')) {
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        }
        if (action?.includes('UPDATE') || action?.includes('RECONCILED') || action?.includes('STATUS')) {
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        }
        if (action?.includes('EXPORTED') || action?.includes('RECORDED')) {
            return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
        }
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    };

    const parseDetails = (details) => {
        try {
            const parsed = JSON.parse(details);
            return Object.entries(parsed)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        } catch {
            return details || '-';
        }
    };

    // Check if user has permission
    const userRole = profile?.role || user?.role;
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="max-w-md border-destructive/20 bg-destructive/5">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                            <FileText className="w-6 h-6 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive">Access Denied</CardTitle>
                        <CardDescription>Only ADMIN and MANAGER roles can access activity logs.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Activity Logs</h1>
                    <p className="text-muted-foreground">Monitor system events and user actions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    {/* Placeholder for Export functionality */}
                    <Button variant="outline" size="sm" disabled title="Export feature coming soon">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Filter & Search
                    </CardTitle>
                    <CardDescription>Customize your view of the audit trail</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search - Spans 4 columns */}
                        <div className="md:col-span-4 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users, actions, details..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                className="pl-9 bg-muted/30 focus:bg-background border-input/50 focus:border-primary transition-colors h-10"
                            />
                        </div>

                        {/* Date Range - Spans 3 columns */}
                        <div className="md:col-span-3 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => {
                                    const newFilters = { ...filters, dateRange: e.target.value };
                                    setFilters(newFilters);
                                    window.electronAPI.audit.getLogs({
                                        dateRange: newFilters.dateRange,
                                        staff_id: newFilters.staff_id,
                                        action: newFilters.action
                                    }).then(setLogs).catch(console.error);
                                }}
                                className="w-full h-10 rounded-md border border-input/50 bg-muted/30 focus:bg-background px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="1days">Last 24 Hours</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 90 Days</option>
                                <option value="">All Time</option>
                            </select>
                        </div>

                        {/* User Filter - Spans 2.5 columns */}
                        <div className="md:col-span-3 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <select
                                value={filters.staff_id || ''}
                                onChange={(e) => {
                                    const newFilters = { ...filters, staff_id: e.target.value || null };
                                    setFilters(newFilters);
                                    window.electronAPI.audit.getLogs({
                                        dateRange: newFilters.dateRange,
                                        staff_id: newFilters.staff_id,
                                        action: newFilters.action
                                    }).then(setLogs).catch(console.error);
                                }}
                                className="w-full h-10 rounded-md border border-input/50 bg-muted/30 focus:bg-background px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">All Users</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Filter - Spans 2.5 columns */}
                        <div className="md:col-span-2 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <Activity className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <select
                                value={filters.action || ''}
                                onChange={(e) => {
                                    const newFilters = { ...filters, action: e.target.value || null };
                                    setFilters(newFilters);
                                    window.electronAPI.audit.getLogs({
                                        dateRange: newFilters.dateRange,
                                        staff_id: newFilters.staff_id,
                                        action: newFilters.action
                                    }).then(setLogs).catch(console.error);
                                }}
                                className="w-full h-10 rounded-md border border-input/50 bg-muted/30 focus:bg-background px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">All Actions</option>
                                {Object.keys(ACTION_LABELS).map(action => (
                                    <option key={action} value={action}>{ACTION_LABELS[action]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px] font-semibold">Timestamp</TableHead>
                            <TableHead className="w-[180px] font-semibold">User</TableHead>
                            <TableHead className="w-[180px] font-semibold">Action</TableHead>
                            <TableHead className="w-[200px] font-semibold">Entity</TableHead>
                            <TableHead className="font-semibold">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="p-4 rounded-full bg-muted/50">
                                            <ScrollText className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div className="text-lg font-medium">No activity logs found</div>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            We couldn't find any records matching your current filters.
                                            Try adjusting the date range or search criteria.
                                        </p>
                                        <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {formatDateTime(log.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                {log.staff_name ? log.staff_name.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium leading-none">{log.staff_name || 'System'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${getActionColor(log.action)} font-medium`}>
                                            {getActionLabel(log.action)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{log.entity_type}</span>
                                            {log.entity_id && (
                                                <span className="text-[10px] uppercase font-mono text-muted-foreground">#{String(log.entity_id).substring(0, 8)}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-muted-foreground truncate max-w-[300px]" title={parseDetails(log.details)}>
                                            {parseDetails(log.details)}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <div>
                    Showing {filteredLogs.length} of {logs.length} logs
                </div>
                <div>
                    Displaying max 1000 most recent records
                </div>
            </div>
        </div>
    );
}
