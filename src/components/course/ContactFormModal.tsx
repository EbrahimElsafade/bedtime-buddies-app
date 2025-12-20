import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { logger } from '@/utils/logger'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message is too long'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface ContactFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ContactFormModal = ({
  open,
  onOpenChange,
}: ContactFormModalProps) => {
  const { t } = useTranslation('courses')
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'send-email',
        {
          body: {
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            message: data.message,
          },
        },
      )

      if (error) {
        throw new Error(error.message)
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to send message')
      }

      toast({
        title: t('contact.successTitle'),
        description: t('contact.successMessage'),
      })

      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      logger.error('Error sending contact form:', error)
      toast({
        title: t('contact.errorTitle'),
        description: t('contact.errorMessage'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('contact.title')}</DialogTitle>
          <DialogDescription>{t('contact.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('contact.namePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('contact.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.phone')}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('contact.phonePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.message')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('contact.messagePlaceholder')}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('contact.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('contact.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
