import React from 'react'

export default function SubmitModal({ open, onClose, onConfirm, loading }){
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[420px] shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Confirm Submit</h3>
        <p className="text-sm text-gray-600">Are you sure you want to submit the test? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md border" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded-md bg-indigo-600 text-white" onClick={onConfirm} disabled={loading}>{loading? 'Submitting...':'Submit Test'}</button>
        </div>
      </div>
    </div>
  )
}
