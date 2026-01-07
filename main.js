import { SheetEngine } from 'https://cdn.brandsxperts.com/core-v1/sheet-engine.js';
import { FormEngine } from 'https://cdn.brandsxperts.com/core-v1/form-engine.js';
import { WhatsappEngine } from 'https://cdn.brandsxperts.com/core-v1/whatsapp-engine.js';
import { SeoEngine } from 'https://cdn.brandsxperts.com/core-v1/seo-engine.js';
import { AntiSpamEngine } from 'https://cdn.brandsxperts.com/core-v1/anti-spam.js';

// Configuration (This would normally come from the build process or a local config file for the specific client)
// For the template, we assume a placeholder URL or we look for a global var injected by the 'cloner'
const API_URL = window.BX_API_URL || 'https://script.google.com/macros/s/AKfycbx.../exec';

async function init() {
    const sheetEngine = new SheetEngine(API_URL);
    const formEngine = new FormEngine(sheetEngine);
    const antiSpam = new AntiSpamEngine();

    // 1. Load Config
    // In a real scenario, we might want to cache this or embed it during build to avoid layout shift.
    // For this dynamic serverless approach, we fetch.
    try {
        const configData = await sheetEngine.read('config');
        const config = {};
        if (Array.isArray(configData)) {
            configData.forEach(row => config[row.key] = row.value);
        }

        // Apply Config
        document.documentElement.style.setProperty('--primary', config.theme_color || '#007bff');

        const title = document.getElementById('hero-title');
        if (title && config.hero_title) title.innerText = config.hero_title;

        const subtitle = document.getElementById('hero-subtitle');
        if (subtitle && config.hero_subtitle) subtitle.innerText = config.hero_subtitle;

        if (config.site_logo) {
            document.getElementById('site-logo').innerText = config.site_logo; // Or Replace with IMG
        }

        // SEO
        const seo = new SeoEngine({ siteName: config.site_name, baseUrl: window.location.origin });
        seo.updateMeta({
            title: config.home_title || 'Bienvenido',
            description: config.home_description,
            image: config.og_image
        });

        // WhatsApp
        if (config.whatsapp_phone) {
            const wa = new WhatsappEngine({
                phone: config.whatsapp_phone,
                defaultMessage: config.whatsapp_msg
            });
            wa.renderWidget();
        }

        // Form
        formEngine.init('#lead-form', 'leads');

        // Anti-Spam
        const form = document.getElementById('lead-form');
        if (form) antiSpam.createHoneypot(form);

        // Show Content
        document.getElementById('loader').style.display = 'none';
        document.querySelector('.hero').style.display = 'block';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('site-footer').style.display = 'block';

    } catch (e) {
        console.error("Initialization failed", e);
        // Fallback or Error State
        document.getElementById('loader').innerHTML = '<p>Error cargando el sitio.</p>';
    }
}

document.addEventListener('DOMContentLoaded', init);
