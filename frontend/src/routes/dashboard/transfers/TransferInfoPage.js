'use client'

import { useContext, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import BIcon from '../../../components/BIcon'
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom'
import { AuthContext } from '../../../providers/AuthProvider'

export default function TransferInfoPage() {
  const { transfers } = useRouteLoaderData("transfers")
  const { id } = useParams()

  const navigate = useNavigate()

  const transfer = useMemo(() => transfers.find(x => x.id === id))

  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  const handleClose = () => {
    if (open) {
      setOpen(false)
      setTimeout(() => navigate(".."), 300)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <div className="fixed inset-0" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}