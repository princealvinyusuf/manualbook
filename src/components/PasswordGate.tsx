import { FormEvent, useEffect, useRef, useState } from 'react'
import { BookOpen, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'

type PasswordGateProps = {
  onUnlock: () => void
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password === '080899') {
      setError('')
      onUnlock()
      return
    }

    setError('Kata sandi tidak sesuai. Silakan periksa dan coba lagi.')
    setPassword('')
    inputRef.current?.focus()
  }

  return (
    <main className="gate-shell">
      <div className="gate-orb gate-orb-one" />
      <div className="gate-orb gate-orb-two" />

      <section className="gate-welcome" aria-labelledby="gate-heading">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-symbol" aria-hidden="true">
            <BookOpen size={24} />
          </span>
          <span>
            <strong>Karirhub</strong>
            <small>Kementerian Ketenagakerjaan RI</small>
          </span>
        </div>

        <div className="gate-copy">
          <p className="eyebrow">Pusat pengetahuan Karirhub</p>
          <h1 id="gate-heading">Panduan lengkap untuk setiap langkah.</h1>
          <p>
            Akses handbook, manual operasional, serta panduan pemecahan masalah
            Karirhub dalam satu ruang baca yang mudah ditelusuri.
          </p>
        </div>

        <div className="gate-trust">
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>Dokumen internal</strong>
            Akses diberikan kepada pengguna yang memiliki kata sandi.
          </span>
        </div>
      </section>

      <section className="gate-panel" aria-label="Masuk ke portal panduan">
        <div className="gate-card">
          <span className="gate-icon" aria-hidden="true">
            <LockKeyhole />
          </span>
          <p className="eyebrow">Akses terbatas</p>
          <h2>Masukkan kata sandi</h2>
          <p className="gate-instruction">
            Gunakan kata sandi yang telah diberikan untuk membuka portal
            panduan Karirhub.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="portal-password">Kata sandi</label>
            <div className={`password-field ${error ? 'has-error' : ''}`}>
              <input
                ref={inputRef}
                id="portal-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) setError('')
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'password-error' : undefined}
                autoComplete="off"
                placeholder="Masukkan kata sandi"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword
                    ? 'Sembunyikan kata sandi'
                    : 'Tampilkan kata sandi'
                }
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <p
              id="password-error"
              className="field-error"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
            <button className="primary-button gate-submit" type="submit">
              Buka panduan
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="gate-note">
            Anda akan diminta memasukkan kata sandi kembali setiap kali halaman
            dibuka atau dimuat ulang.
          </p>
        </div>
      </section>
    </main>
  )
}
