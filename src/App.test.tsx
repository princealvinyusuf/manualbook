import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Karirhub manual portal', () => {
  it('shows the protected reader, navigation, search, and PDF actions', async () => {
    const user = userEvent.setup()

    render(<App />)
    expect(
      screen.getByRole('heading', {
        name: 'Panduan lengkap untuk setiap langkah.',
      }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Kata sandi'), '080899')
    await user.click(screen.getByRole('button', { name: 'Buka panduan' }))

    expect(
      screen.getByRole('heading', {
        name: 'Panduan Penggunaan dan Operasional Karirhub',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Daftar isi')).toBeInTheDocument()
    expect(screen.getByLabelText('Cari di dalam panduan')).toBeInTheDocument()

    const pdfLinks = screen.getAllByRole('link', { name: 'Unduh PDF' })
    expect(pdfLinks).toHaveLength(2)
    pdfLinks.forEach((link) => {
      expect(link).toHaveAttribute(
        'href',
        'https://paskerid.kemnaker.go.id/manualbook.pdf',
      )
    })
  })
})
