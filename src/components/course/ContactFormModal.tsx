import { useState, useEffect, useCallback } from 'react'
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
import { WhatsappSubscribeButton } from '@/components/WhatsappSubscribeButton'

// reCAPTCHA v3 site key (public)
const RECAPTCHA_SITE_KEY = '6LcExample_YOUR_SITE_KEY' // Replace with your actual site key

// Load reCAPTCHA script
const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(script)
  })
}

// Get reCAPTCHA token
const getRecaptchaToken = async (action: string): Promise<string> => {
  await loadRecaptchaScript()
  return new Promise((resolve, reject) => {
    ;(window as any).grecaptcha.ready(() => {
      ;(window as any).grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(reject)
    })
  })
}

// Contact form data shape
interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  website: string // Honeypot field for bot detection
}

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
  const [showWhatsappModal, setShowWhatsappModal] = useState(false)

  // Create schema here so we can use translated messages
  const contactFormSchema = z.object({
    name: z
      .string()
      .min(1, t('contact.validation.nameRequired'))
      .max(100, t('contact.validation.nameTooLong')),
    email: z
      .string()
      .email(t('contact.validation.emailInvalid'))
      .max(255, t('contact.validation.emailTooLong')),
    phone: z
      .string()
      .min(1, t('contact.validation.phoneRequired'))
      .max(20, t('contact.validation.phoneTooLong')),
    message: z
      .string()
      .min(1, t('contact.validation.messageRequired'))
      .max(1000, t('contact.validation.messageTooLong')),
    website: z.string().max(0).optional(), // Honeypot - should always be empty
  })

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      website: '', // Honeypot field
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      // Get reCAPTCHA token
      let recaptchaToken = ''
      try {
        recaptchaToken = await getRecaptchaToken('contact_form')
      } catch (captchaError) {
        logger.warn('reCAPTCHA token generation failed:', captchaError)
        // Continue without token - backend will handle validation
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('specialist_requests')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        })

      if (dbError) {
        throw new Error(dbError.message)
      }

      // Also send email notification with reCAPTCHA token
      const { data: response, error } = await supabase.functions.invoke(
        'send-email',
        {
          body: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            website: data.website, // Honeypot field
            recaptchaToken, // reCAPTCHA token for verification
          },
        },
      )

      if (error) {
        logger.warn('Email notification failed but request was saved:', error)
      }

      if (response && !response.success) {
        logger.warn(
          'Email notification failed but request was saved:',
          response.error,
        )
      }

      toast({
        title: t('contact.successTitle'),
        description: t('contact.successMessage'),
      })

      form.reset()
      // close contact modal and show whatsapp follow-up
      onOpenChange(false)
      setShowWhatsappModal(true)
    } catch (error: unknown) {
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

  // handle closing the contact modal so we can show the whatsapp modal
  const handleContactOpenChange = (val: boolean) => {
    onOpenChange(val)
    if (!val) {
      setShowWhatsappModal(true)
    }
  }

  // reset whatsapp modal when the contact modal is opened again
  // so it only appears after a close
  useEffect(() => {
    if (open) setShowWhatsappModal(false)
  }, [open])

  return (
    <>
      <Dialog open={open} onOpenChange={handleContactOpenChange}>
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

              {/* Honeypot field - hidden from users, bots will fill it */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleContactOpenChange(false)}
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

      {/* WhatsApp follow-up modal shown after contact modal closes */}
      <Dialog open={showWhatsappModal} onOpenChange={setShowWhatsappModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className='grid gap-4'>
            <DialogTitle>{t('contact.whatsappTitle')}</DialogTitle>
            <DialogDescription>
              {t('contact.whatsappDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              {t('contact.whatsappMessage')}
            </p>

            <div className="flex pt-2">
              <WhatsappSubscribeButton
                className="w-full"
                label={t('contact.contactViaWhatsapp')}
                message={t('contact.contactViaWhatsapp')}
              />
              <Button
                variant="outline"
                onClick={() => setShowWhatsappModal(false)}
              >
                {t('contact.close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
