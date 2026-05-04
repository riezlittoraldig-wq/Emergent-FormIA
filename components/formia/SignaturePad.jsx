'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Pen, Trash2, Check } from 'lucide-react'

/**
 * SignaturePad — canvas de signature manuscrite
 * Props :
 *   value      : string base64 (data:image/png;base64,...) ou ''
 *   onChange   : (base64 | '') => void
 *   label      : string
 *   disabled   : bool
 */
export function SignaturePad({ value, onChange, label = 'Signature', disabled = false }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [confirmed, setConfirmed] = useState(!!value)
  const lastPos = useRef(null)

  // Charger une signature existante dans le canvas
  useEffect(() => {
    if (value && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = value
      setHasStrokes(true)
      setConfirmed(true)
    }
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = useCallback((e) => {
    if (disabled || confirmed) return
    e.preventDefault()
    const canvas = canvasRef.current
    const pos = getPos(e, canvas)
    lastPos.current = pos
    setDrawing(true)

    // Point unique (clic sans mouvement)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
  }, [disabled, confirmed])

  const draw = useCallback((e) => {
    if (!drawing || disabled || confirmed) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    lastPos.current = pos
    setHasStrokes(true)
  }, [drawing, disabled, confirmed])

  const stopDrawing = useCallback(() => {
    setDrawing(false)
    lastPos.current = null
  }, [])

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    setConfirmed(false)
    onChange('')
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current
    const base64 = canvas.toDataURL('image/png')
    onChange(base64)
    setConfirmed(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <Pen className="w-3.5 h-3.5" />
          {label}
        </span>
        <div className="flex gap-2">
          {hasStrokes && !confirmed && (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              className="h-7 text-xs bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <Check className="w-3 h-3 mr-1" />
              Valider
            </Button>
          )}
          {(hasStrokes || confirmed) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="h-7 text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      <div className={`relative rounded-xl border-2 transition-colors overflow-hidden ${
        confirmed
          ? 'border-green-400 bg-green-50/30'
          : drawing
            ? 'border-blue-400 bg-slate-50'
            : 'border-dashed border-slate-300 bg-slate-50 hover:border-slate-400'
      }`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full touch-none cursor-crosshair"
          style={{ display: 'block' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Placeholder si vide */}
        {!hasStrokes && !confirmed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-sm">Signez ici</p>
          </div>
        )}

        {/* Badge validé */}
        {confirmed && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3" />
            Validée
          </div>
        )}
      </div>

      {!confirmed && !hasStrokes && (
        <p className="text-xs text-slate-400">
          Tracez votre signature à la souris ou au doigt, puis cliquez sur Valider
        </p>
      )}
    </div>
  )
}
