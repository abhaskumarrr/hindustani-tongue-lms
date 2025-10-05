export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      <div className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ह</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Hindustani Tongue</span>
          </div>
          <p className="text-sm text-muted-foreground">Learn Indian languages with a structured 80% completion model.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
            <li><a href="mailto:support@hindustanitungue.com" className="text-muted-foreground hover:text-foreground">support@hindustanitungue.com</a></li>
            <li><a href="https://wa.me/" className="text-muted-foreground hover:text-foreground">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
            <li><a href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
            <li><a href="/refunds" className="text-muted-foreground hover:text-foreground">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hindustani Tongue. All rights reserved. Made with ❤️ for heritage learners worldwide.
        </div>
      </div>
    </footer>
  )
}



