import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2 } from 'lucide-react'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'

interface ContactUsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authApi.contact(form)
      toast.success('Message sent successfully!')
      setForm({ fullName: '', email: '', phone: '', address: '', message: '' })
      onClose()
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="contact-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="contact-modal-card"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="contact-modal-close"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="mb-3">
              <h2 className="text-lg font-bold text-white mb-1">Contact Us</h2>
              <p className="text-secondary text-xs">We&apos;d love to hear from you. Send us a message!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label className="label-field text-xs">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="input-field px-3 py-2 text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="label-field text-xs">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field px-3 py-2 text-sm"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="label-field text-xs">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field px-3 py-2 text-sm"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
              <div>
                <label className="label-field text-xs">Current Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field px-3 py-2 text-sm"
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>
              <div>
                <label className="label-field text-xs">Issue / Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field px-3 py-2 resize-none text-sm"
                  rows={3}
                  placeholder="Describe your issue or message..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="contact-submit-btn w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
