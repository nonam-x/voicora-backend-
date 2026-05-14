import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiAddLine,
  RiDeleteBinLine,
  RiDraggable,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiEyeLine,
  RiSaveLine,
  RiSendPlaneLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import { pollApi } from '../services/api'
import { getErrorMessage } from '../lib/errors'
import toast from 'react-hot-toast'

/* ---- Toggle component ---- */
function Toggle({ enabled, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between w-full py-2"
    >
      <span className="text-[13px] text-text-muted">{label}</span>
      <div className={`w-8 h-[18px] rounded-full p-[2px] transition-colors ${enabled ? 'bg-accent-violet' : 'bg-bg-muted'}`}>
        <div className={`w-[14px] h-[14px] rounded-full bg-white transition-transform ${enabled ? 'translate-x-3.5' : ''}`} />
      </div>
    </button>
  )
}

/* ---- Default question ---- */
const createQuestion = (idx) => ({
  id: Date.now() + idx,
  text: '',
  required: true,
  options: ['', ''],
})

/* ---- Steps ---- */
const steps = ['Details', 'Questions', 'Settings', 'Review']

export default function CreatePoll() {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([createQuestion(0)])
  const [settings, setSettings] = useState({
    anonymous: true,
    showResults: true,
    requireAuth: false,
    expiryDate: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  /* Question helpers */
  const addQuestion = () => setQuestions([...questions, createQuestion(questions.length)])
  const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id))
  const updateQuestion = (id, field, value) =>
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  const addOption = (qId) =>
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...q.options, ''] } : q))
  const removeOption = (qId, idx) =>
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q))
  const updateOption = (qId, idx, value) =>
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: q.options.map((o, i) => i === idx ? value : o) } : q))

  const canNext = step === 0 ? title.trim().length > 0 : step === 1 ? questions.every(q => q.text.trim() && q.options.every(o => o.trim())) : true

  /* Save as draft */
  const saveDraft = async () => {
    setSubmitting(true)
    try {
      const payload = buildPayload()
      await pollApi.create(payload)
      toast.success('Poll saved as draft!')
      navigate('/app')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  /* Publish poll */
  const publishPoll = async () => {
    setSubmitting(true)
    try {
      const payload = buildPayload()
      const res = await pollApi.create(payload)
      const pollId = res.data.data._id
      // Activate the poll immediately
      await pollApi.activate(pollId)
      toast.success('Poll published and live!')
      navigate('/app')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function buildPayload() {
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      questions: questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => ({ text: o.trim() })),
      })),
      responseMode: settings.requireAuth ? 'authenticated' : 'anonymous',
      isPublic: true,
      showResultsAfterVoting: settings.showResults,
    }
    if (settings.expiryDate) {
      payload.expiresAt = new Date(settings.expiryDate).toISOString()
    }
    return payload
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/app" className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-bg-secondary transition-colors">
            <RiArrowLeftLine className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Create Poll</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                i === step
                  ? 'bg-bg-secondary text-text-primary'
                  : i < step
                  ? 'text-accent-violet cursor-pointer'
                  : 'text-text-faint cursor-default'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                i < step ? 'bg-accent-violet text-white' : i === step ? 'bg-bg-tertiary text-text-primary' : 'bg-bg-muted text-text-faint'
              }`}>
                {i < step ? <RiCheckLine className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border-subtle" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Main form */}
        <div className="rounded-xl border border-border-subtle bg-bg-base">
          <AnimatePresence mode="wait">
            {/* Step 0: Details */}
            {step === 0 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <h2 className="text-[15px] font-medium text-text-primary mb-5">Poll Details</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-medium text-text-muted mb-1.5">Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Tech Stack Survey 2026"
                      className="w-full px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-[14px] text-text-primary placeholder-text-faint outline-none focus:border-border-default focus:ring-1 focus:ring-border-default transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-text-muted mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description for context..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-[14px] text-text-primary placeholder-text-faint outline-none focus:border-border-default focus:ring-1 focus:ring-border-default transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Questions */}
            {step === 1 && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-medium text-text-primary">Questions</h2>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-accent-violet bg-accent-violet/10 hover:bg-accent-violet/15 transition-colors"
                  >
                    <RiAddLine className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-5">
                  {questions.map((q, qi) => (
                    <div key={q.id} className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <RiDraggable className="w-4 h-4 text-text-faint cursor-grab" />
                          <span className="text-[11px] font-medium text-text-faint uppercase tracking-wider">
                            Question {qi + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {questions.length > 1 && (
                            <button
                              onClick={() => removeQuestion(q.id)}
                              className="p-1 rounded text-text-faint hover:text-red-400 transition-colors"
                            >
                              <RiDeleteBinLine className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                        placeholder="Enter your question..."
                        className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-[13px] text-text-primary placeholder-text-faint outline-none focus:border-border-default transition-all mb-3"
                      />

                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-border-default flex items-center justify-center text-[10px] text-text-faint shrink-0">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(q.id, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 px-3 py-1.5 rounded-md bg-bg-secondary border border-border-subtle text-[12px] text-text-primary placeholder-text-faint outline-none focus:border-border-default transition-all"
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(q.id, oi)}
                                className="p-1 text-text-faint hover:text-red-400 transition-colors"
                              >
                                <RiCloseLine className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(q.id)}
                          className="flex items-center gap-1 text-[11px] text-text-faint hover:text-accent-violet transition-colors mt-1 ml-7"
                        >
                          <RiAddLine className="w-3 h-3" />
                          Add option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <h2 className="text-[15px] font-medium text-text-primary mb-5">Settings</h2>

                <div className="space-y-1 mb-6">
                  <Toggle label="Anonymous responses" enabled={settings.anonymous} onChange={(v) => setSettings({...settings, anonymous: v})} />
                  <Toggle label="Show results after voting" enabled={settings.showResults} onChange={(v) => setSettings({...settings, showResults: v})} />
                  <Toggle label="Require authentication" enabled={settings.requireAuth} onChange={(v) => setSettings({...settings, requireAuth: v})} />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-text-muted mb-1.5">
                    <RiCalendarLine className="inline w-3 h-3 mr-1" />
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={settings.expiryDate}
                    onChange={(e) => setSettings({...settings, expiryDate: e.target.value})}
                    className="w-full max-w-xs px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-[13px] text-text-primary outline-none focus:border-border-default transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <h2 className="text-[15px] font-medium text-text-primary mb-5">Review & Publish</h2>

                <div className="space-y-5">
                  <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                    <p className="text-[11px] text-text-faint uppercase tracking-wider mb-1">Title</p>
                    <p className="text-[14px] text-text-primary font-medium">{title || 'Untitled Poll'}</p>
                    {description && <p className="text-[12px] text-text-muted mt-1">{description}</p>}
                  </div>

                  <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                    <p className="text-[11px] text-text-faint uppercase tracking-wider mb-3">
                      {questions.length} Question{questions.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div key={q.id}>
                          <p className="text-[13px] text-text-secondary font-medium mb-1">
                            {i + 1}. {q.text || 'Untitled question'}
                          </p>
                          <div className="flex flex-wrap gap-1.5 ml-4">
                            {q.options.map((o, oi) => (
                              <span key={oi} className="px-2 py-0.5 rounded-md bg-bg-muted text-[11px] text-text-faint">
                                {o || `Option ${oi + 1}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                    <p className="text-[11px] text-text-faint uppercase tracking-wider mb-2">Settings</p>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <span className="text-text-faint">Anonymous: <span className="text-text-secondary">{settings.anonymous ? 'Yes' : 'No'}</span></span>
                      <span className="text-text-faint">Show results: <span className="text-text-secondary">{settings.showResults ? 'Yes' : 'No'}</span></span>
                      <span className="text-text-faint">Require auth: <span className="text-text-secondary">{settings.requireAuth ? 'Yes' : 'No'}</span></span>
                      <span className="text-text-faint">Expiry: <span className="text-text-secondary">{settings.expiryDate || 'None'}</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live preview sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <div className="rounded-xl border border-border-subtle bg-bg-base p-5">
              <div className="flex items-center gap-2 mb-4">
                <RiEyeLine className="w-3.5 h-3.5 text-text-faint" />
                <span className="text-[12px] font-medium text-text-faint uppercase tracking-wider">Live Preview</span>
              </div>

              {/* Mini preview */}
              <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                <h3 className="text-[14px] font-medium text-text-primary mb-2 truncate">
                  {title || 'Your poll title'}
                </h3>
                {description && (
                  <p className="text-[11px] text-text-faint mb-3 line-clamp-2">{description}</p>
                )}
                {questions.slice(0, 2).map((q, i) => (
                  <div key={q.id} className={i > 0 ? 'mt-3 pt-3 border-t border-border-subtle' : ''}>
                    <p className="text-[12px] text-text-secondary mb-2">{q.text || `Question ${i + 1}`}</p>
                    <div className="space-y-1.5">
                      {q.options.slice(0, 3).map((o, oi) => (
                        <div key={oi} className="px-3 py-1.5 rounded-md border border-border-subtle text-[11px] text-text-faint hover:border-border-default transition-colors">
                          {o || `Option ${oi + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {questions.length > 2 && (
                  <p className="text-[10px] text-text-faint mt-3">+{questions.length - 2} more questions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom actions */}
      <div className="sticky bottom-0 mt-6 -mx-5 lg:-mx-8 px-4 sm:px-5 lg:px-8 py-3 sm:py-4 bg-bg-primary/95 backdrop-blur-sm border-t border-border-subtle">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-text-faint hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <RiArrowLeftLine className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              disabled={submitting || !title.trim()}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-text-faint border border-border-subtle hover:text-text-primary hover:border-border-default disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiSaveLine className="w-3.5 h-3.5" />}
              Save Draft
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-medium text-bg-primary bg-text-primary hover:bg-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <RiArrowRightLine className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={publishPoll}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-medium text-white bg-accent-violet hover:bg-accent-violet/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiSendPlaneLine className="w-3.5 h-3.5" />}
                Publish Poll
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
