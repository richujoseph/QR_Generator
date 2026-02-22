/**
 * ══════════════════════════════════════════════════
 *  Template Library — Pre-built QR code templates
 *  for common use cases.
 * ══════════════════════════════════════════════════
 */

export const TEMPLATES = [
    {
        id: 'restaurant-menu',
        name: 'Restaurant Menu',
        description: 'Link to your digital menu',
        type: 'url',
        data: { value: 'https://your-restaurant.com/menu' },
        preset: 'sunset',
    },
    {
        id: 'event-ticket',
        name: 'Event Ticket',
        description: 'Event check-in link',
        type: 'url',
        data: { value: 'https://your-event.com/ticket' },
        preset: 'neon',
    },
    {
        id: 'wifi-guest',
        name: 'WiFi Guest Access',
        description: 'Share WiFi with guests',
        type: 'wifi',
        data: { ssid: 'GuestNetwork', password: 'welcome123', encryption: 'WPA' },
        preset: 'ocean',
    },
    {
        id: 'business-card',
        name: 'Business Card',
        description: 'Your contact info',
        type: 'vcard',
        data: { firstName: 'John', lastName: 'Doe', phone: '+1234567890', email: 'john@example.com', company: 'Acme Inc', title: 'CEO' },
        preset: 'midnight',
    },
    {
        id: 'social-profile',
        name: 'Social Profile',
        description: 'Link to your profile',
        type: 'url',
        data: { value: 'https://instagram.com/yourprofile' },
        preset: 'cherry',
    },
    {
        id: 'payment-link',
        name: 'Payment Link',
        description: 'UPI or payment URL',
        type: 'url',
        data: { value: 'https://pay.example.com/you' },
        preset: 'gold',
    },
    {
        id: 'product-label',
        name: 'Product Label',
        description: 'Product info page',
        type: 'url',
        data: { value: 'https://your-store.com/product/123' },
        preset: 'forest',
    },
    {
        id: 'feedback-form',
        name: 'Feedback Form',
        description: 'Customer feedback link',
        type: 'url',
        data: { value: 'https://forms.google.com/your-form' },
        preset: 'classic',
    },
];
