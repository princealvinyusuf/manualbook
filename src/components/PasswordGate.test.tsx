import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PasswordGate } from './PasswordGate'

describe('PasswordGate', () => {
  it('rejects an incorrect password and keeps the portal locked', async () => {
    const user = userEvent.setup()
    const onUnlock = vi.fn()

    render(<PasswordGate onUnlock={onUnlock} />)
    await user.type(screen.getByLabelText('Kata sandi'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Buka panduan' }))

    expect(onUnlock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Kata sandi tidak sesuai',
    )
  })

  it('unlocks only with the configured password', async () => {
    const user = userEvent.setup()
    const onUnlock = vi.fn()

    render(<PasswordGate onUnlock={onUnlock} />)
    await user.type(screen.getByLabelText('Kata sandi'), '080899')
    await user.click(screen.getByRole('button', { name: 'Buka panduan' }))

    expect(onUnlock).toHaveBeenCalledOnce()
  })
})
