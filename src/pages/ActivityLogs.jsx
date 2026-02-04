import React, { useEffect, useState } from 'react';
import { FileText, Search, Filter } from 'lucide-react';
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
        try {
            const allLogs = await window.electronAPI.audit.getLogs({
                dateRange: filters.dateRange,
                staff_id: filters.staff_id,
                action: filters.action
            });
            setLogs(allLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
        }
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
        if (action?.includes('CREATE') || action?.includes('APPROVED')) {
            return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
        }
        if (action?.includes('DELETE') || action?.includes('REJECTED')) {
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        }
        if (action?.includes('UPDATE') || action?.includes('RECONCILED')) {
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
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
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>Only ADMIN and MANAGER roles can access activity logs</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
                <p className="text-muted-foreground">Audit trail of all system activities</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>View and filter system activity logs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Date Range</label>
                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => {
                                        const newFilters = { ...filters, dateRange: e.target.value };
                                        setFilters(newFilters);
                                        // Reload logs with new filters
                                        window.electronAPI.audit.getLogs({
                                            dateRange: newFilters.dateRange,
                                            staff_id: newFilters.staff_id,
                                            action: newFilters.action
                                        }).then(setLogs).catch(console.error);
                                    }}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                >
                                    <option value="1days">Last 24 hours</option>
                                    <option value="7days">Last 7 days</option>
                                    <option value="30days">Last 30 days</option>
                                    <option value="90days">Last 90 days</option>
                                    <option value="">All time</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">User</label>
                                <select
                                    value={filters.staff_id || ''}
                                    onChange={(e) => {
                                        const newFilters = { ...filters, staff_id: e.target.value || null };
                                        setFilters(newFilters);
                                        // Reload logs with new filters
                                        window.electronAPI.audit.getLogs({
                                            dateRange: newFilters.dateRange,
                                            staff_id: newFilters.staff_id,
                                            action: newFilters.action
                                        }).then(setLogs).catch(console.error);
                                    }}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                >
                                    <option value="">All users</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Action</label>
                                <select
                                    value={filters.action || ''}
                                    onChange={(e) => {
                                        const newFilters = { ...filters, action: e.target.value || null };
                                        setFilters(newFilters);
                                        // Reload logs with new filters
                                        window.electronAPI.audit.getLogs({
                                            dateRange: newFilters.dateRange,
                                            staff_id: newFilters.staff_id,
                                            action: newFilters.action
                                        }).then(setLogs).catch(console.error);
                                    }}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                                >
                                    <option value="">All actions</option>
                                    {Object.keys(ACTION_LABELS).map(action => (
                                        <option key={action} value={action}>{ACTION_LABELS[action]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        value={filters.searchQuery}
                                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Entity</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No activity logs found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {formatDateTime(log.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{log.staff_name || 'System'}</p>
                                                        <p className="text-xs text-muted-foreground">ID: {log.staff_id || 'N/A'}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getActionColor(log.action)}>
                                                        {getActionLabel(log.action)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{log.entity_type}</p>
                                                        {log.entity_id && (
                                                            <p className="text-xs text-muted-foreground">ID: {log.entity_id}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-md">
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {parseDetails(log.details)}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="text-sm text-muted-foreground text-center">
                            Showing {filteredLogs.length} of {logs.length} logs (max 1000 most recent)
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
