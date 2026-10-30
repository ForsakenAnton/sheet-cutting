import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DONATE } from '../donate';
import { CoffeeIcon } from './CoffeeIcon';

/** Card number in groups of four, as printed on the card. */
const cardGroups = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

/** Bootstrap modal markup driven by React state (the app does not load Bootstrap's JavaScript). */
export function DonateDialog({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const digits = DONATE.card.replace(/\D/g, '');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  // Digits only: bank apps don't all accept spaces in a pasted number.
  const copy = () => void navigator.clipboard?.writeText(digits).then(() => setCopied(true));

  return createPortal(
    <>
      <div
        ref={dialogRef}
        className="modal d-block donate-modal d-print-none"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <button
                type="button"
                className="btn-close ms-auto"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body px-4 pt-0 pb-4">
              <div className="donate-hero">
                <span className="donate-cup" aria-hidden="true">
                  <CoffeeIcon size={44} strokeWidth={1.6} steam />
                </span>
                <h2 id="donate-title" className="h4 fw-semibold mt-3 mb-2">
                  Buy me a coffee
                </h2>
                <p className="text-body-secondary mb-0">
                  Sheet Cutting Planner is free and has no ads. If it saved you material or time,
                  you can buy its author a coffee. Thank you!
                </p>
              </div>
              {DONATE.links.length > 0 && (
                <div className="donate-links">
                  {DONATE.links.map((link, i) => (
                    <a
                      key={link.url}
                      className={`btn ${i === 0 ? 'btn-primary' : 'btn-outline-secondary'} donate-link`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Support via {link.title}
                      <i className="bi bi-arrow-up-right" />
                    </a>
                  ))}
                </div>
              )}
              {digits && (
                <div className="donate-card">
                  <span className="small text-body-secondary">Card number</span>
                  <div className="donate-number">
                    <span>{cardGroups(digits)}</span>
                    <button
                      type="button"
                      className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                      title={copied ? 'Copied' : 'Copy'}
                      aria-label={copied ? 'Copied' : 'Copy'}
                      onClick={copy}
                    >
                      <i className={`bi ${copied ? 'bi-check2' : 'bi-copy'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show d-print-none" />
    </>,
    document.body,
  );
}
