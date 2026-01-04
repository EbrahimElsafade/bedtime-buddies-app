import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { DataTable } from '@/components/admin/DataTable'
import { DataTableColumnHeader } from '@/components/admin/DataTableColumnHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface SpecialistRequest {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

const SpecialistRequests = () => {
  const { t } = useTranslation('admin')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState<SpecialistRequest | null>(null)
  const [deleteRequest, setDeleteRequest] = useState<SpecialistRequest | null>(null)

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['specialist-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialist_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as SpecialistRequest[]
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('specialist_requests')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-requests'] })
      toast({
        title: t('specialistRequests.statusUpdated'),
        description: t('specialistRequests.statusUpdatedDesc'),
      })
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('specialistRequests.updateError'),
        variant: 'destructive',
      })
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t('specialistRequests.pending')}
          </Badge>
        )
      case 'reviewed':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <Eye className="h-3 w-3" />
            {t('specialistRequests.reviewed')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            {t('specialistRequests.completed')}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('specialistRequests.rejected')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns: ColumnDef<SpecialistRequest>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('specialistRequests.name')} />
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('specialistRequests.email')} />
      ),
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="text-primary hover:underline"
        >
          {row.original.email}
        </a>
      ),
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('specialistRequests.phone')} />
      ),
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.phone}`}
          className="text-primary hover:underline"
        >
          {row.original.phone}
        </a>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('specialistRequests.status')} />
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('specialistRequests.date')} />
      ),
      cell: ({ row }) => format(new Date(row.original.created_at), 'PPp'),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedRequest(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Select
            value={row.original.status}
            onValueChange={(value) =>
              updateStatusMutation.mutate({ id: row.original.id, status: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t('specialistRequests.pending')}</SelectItem>
              <SelectItem value="reviewed">{t('specialistRequests.reviewed')}</SelectItem>
              <SelectItem value="completed">{t('specialistRequests.completed')}</SelectItem>
              <SelectItem value="rejected">{t('specialistRequests.rejected')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('specialistRequests.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('specialistRequests.description')}
        </p>
      </div>

      <DataTable columns={columns} data={requests} isLoading={isLoading} />

      {/* View Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('specialistRequests.requestDetails')}</DialogTitle>
            <DialogDescription>
              {selectedRequest &&
                format(new Date(selectedRequest.created_at), 'PPPp')}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('specialistRequests.name')}
                </h4>
                <p className="mt-1">{selectedRequest.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('specialistRequests.email')}
                </h4>
                <p className="mt-1">
                  <a
                    href={`mailto:${selectedRequest.email}`}
                    className="text-primary hover:underline"
                  >
                    {selectedRequest.email}
                  </a>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('specialistRequests.phone')}
                </h4>
                <p className="mt-1">
                  <a
                    href={`tel:${selectedRequest.phone}`}
                    className="text-primary hover:underline"
                  >
                    {selectedRequest.phone}
                  </a>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('specialistRequests.status')}
                </h4>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('specialistRequests.message')}
                </h4>
                <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3">
                  {selectedRequest.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRequest} onOpenChange={() => setDeleteRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('specialistRequests.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Delete functionality if needed
                setDeleteRequest(null)
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SpecialistRequests
