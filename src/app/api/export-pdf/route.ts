import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html, documentTitle } = body;

    if (!html) {
      return NextResponse.json({ error: 'Missing html content' }, { status: 400 });
    }

    console.log('--- EXPORT PDF DEBUG ---');
    console.log(`Export root found: ${html ? 'YES' : 'NO'}`);
    console.log(`HTML length: ${html?.length}`);
    console.log(`HTML preview (first 300 chars): ${html?.substring(0, 300)}`);
    console.log('------------------------');

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // We construct a full HTML document including Tailwind to ensure styling works
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${documentTitle || 'Resume'}</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Merriweather:wght@300;400;700;900&family=Playfair+Display:wght@400;500;600;700;800&family=Lora:wght@400;500;600;700&family=Fira+Code:wght@400;500;600;700&display=swap');
            
            :root {
              --background: oklch(1 0 0);
              --foreground: oklch(0.145 0 0);
              --primary: oklch(0.205 0 0);
              --primary-foreground: oklch(0.985 0 0);
              --muted: oklch(0.97 0 0);
              --muted-foreground: oklch(0.556 0 0);
              --border: oklch(0.922 0 0);
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              min-height: 297mm;
              background: white;
            }
            body {
              display: block;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Inter', sans-serif;
            }
            * {
              box-sizing: border-box;
            }
            
            /* CRITICAL TAILWIND FALLBACK CSS */
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-row { flex-direction: row; }
            .flex-wrap { flex-wrap: wrap; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .items-end { align-items: flex-end; }
            .items-baseline { align-items: baseline; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .justify-end { justify-content: flex-end; }
            .justify-start { justify-content: flex-start; }
            .w-full { width: 100%; }
            .h-full { height: 100%; }
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .gap-10 { gap: 2.5rem; }
            .p-4 { padding: 1rem; }
            .p-8 { padding: 2rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .ml-auto { margin-left: auto; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .text-justify { text-align: justify; }
            .font-normal { font-weight: 400; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .italic { font-style: italic; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .tracking-widest { letter-spacing: 0.1em; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .border { border-width: 1px; }
            .border-b { border-bottom-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-l { border-left-width: 1px; }
            .border-r { border-right-width: 1px; }
            .rounded { border-radius: 0.25rem; }
            .rounded-md { border-radius: 0.375rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-full { border-radius: 9999px; }
            .bg-white { background-color: #ffffff; }
            .text-black { color: #000000; }
            .text-white { color: #ffffff; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .opacity-0 { opacity: 0; }
            .opacity-100 { opacity: 1; }
            .shrink-0 { flex-shrink: 0; }
            .flex-1 { flex: 1 1 0%; }
            .export-pdf-page {
              margin: 0;
              padding: 0;
              width: 210mm;
              min-height: 297mm;
              page-break-before: auto;
              break-before: auto;
            }
            
            /* Template specific safety overrides */
            img { max-width: 100%; height: auto; }
            svg { max-width: 100%; }

            /* Clean Professional Export Fixes */
            .clean-professional-export {
              page-break-before: auto !important;
              break-before: auto !important;
              min-height: auto !important;
              padding: 24px !important;
              display: block !important;
            }
            .clean-professional-export header {
              page-break-after: avoid !important;
              break-after: avoid !important;
              margin-bottom: 12px !important;
              padding-bottom: 8px !important;
            }
            .clean-professional-export > div:not(header) {
              display: block !important;
            }
            .clean-professional-export section {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              margin-bottom: 12px !important;
            }
          </style>
        </head>
        <body>
          <div class="export-pdf-page">
            ${html}
          </div>
        </body>
      </html>
    `;

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1
    });

    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });

    // Wait for Tailwind CDN to process and inject styles, and for fonts to load
    try {
      await page.waitForFunction(() => !!document.getElementById('tailwindcss-stylesheet') || !!document.querySelector('style[data-tailwindcss]'), { timeout: 1500 });
    } catch (e) {
      console.log('Tailwind style tag wait timed out, proceeding anyway...');
    }
    
    try {
      await page.evaluateHandle('document.fonts.ready');
    } catch (e) {
      console.log('Fonts ready wait timed out, proceeding anyway...');
    }

    // Additional buffer for CSS layout calculation (reduced for speed)
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documentTitle || 'Resume'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
