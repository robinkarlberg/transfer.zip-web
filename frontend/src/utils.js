
export function capitalizeFirstLetter(string) {
    if (typeof string !== 'string' || string.length === 0) {
        return string;
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalizeAllWords(string) {
    if (typeof string !== 'string' || string.length === 0) {
        return string;
    }

    return string
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function formatCurrency(amount, currencyCode) {
    if (!amount || !currencyCode) return undefined;

    const formatter = new Intl.NumberFormat(navigator.language || "en-US", {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    // Format the amount using the locale-specific currency formatter without decimals
    const formattedAmount = formatter.format(amount);

    return formattedAmount;
}

export function getDimensionsFormatted(artObj) {
    if (!artObj || typeof artObj !== 'object') return undefined;

    const { dimension_width, dimension_height, dimension_unit = 'cm' } = artObj;

    if (dimension_width && dimension_height) {
        return `${dimension_width}x${dimension_height} ${dimension_unit}`;
    } else if (dimension_width) {
        return `${dimension_width} ${dimension_unit}`;
    } else if (dimension_height) {
        return `${dimension_height} ${dimension_unit}`;
    }

    return undefined;
}

export const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
}

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const formListener = (ref, callback) => () => {
    const form = ref.current
    const handleChange = (event) => {
        console.log(`${event.target.name} changed to: ${event.target.value}`)
        callback(form)
    }

    if (form) {
        const inputs = form.querySelectorAll('input, textarea')
        inputs.forEach(input => input.addEventListener('input', handleChange))
    }

    return () => {
        if (form) {
            const inputs = form.querySelectorAll('input, textarea')
            inputs.forEach(input => input.removeEventListener('input', handleChange))
        }
    }
}

export function getLuminance(color) {
    // Remove the hash if present
    color = color.replace(/^#/, '');

    // Parse r, g, b values
    let r = parseInt(color.substring(0, 2), 16) / 255;
    let g = parseInt(color.substring(2, 4), 16) / 255;
    let b = parseInt(color.substring(4, 6), 16) / 255;

    // Apply sRGB gamma correction
    r = (r <= 0.03928) ? r / 12.92 : Math.pow(((r + 0.055) / 1.055), 2.4);
    g = (g <= 0.03928) ? g / 12.92 : Math.pow(((g + 0.055) / 1.055), 2.4);
    b = (b <= 0.03928) ? b / 12.92 : Math.pow(((b + 0.055) / 1.055), 2.4);

    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isWaitlist() {
    return process.env.REACT_APP_WAITLIST === "true"
}

// early offer expires february 1st 2025
export function isEarlyOffer() {
    return false
    const currentDate = new Date();
    const cutoffDate = new Date(Date.UTC(2025, 1, 1)); // February 1st, 2025 in UTC

    return currentDate.getTime() < cutoffDate.getTime();
}