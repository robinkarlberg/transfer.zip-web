
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

export function humanFileName(fileName) {
    // List of common file extensions to remove
    const knownExtensions = [
        'txt', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'mp3', 'mp4', 'wav', 'avi', 'mov', 'mkv', 'xml', 'zip', 'rar', '7z'
    ];

    // Find the last dot in the file name
    const lastDotIndex = fileName.lastIndexOf('.');

    // If a dot exists and the extension is in the knownExtensions list
    if (lastDotIndex !== -1) {
        const extension = fileName.slice(lastDotIndex + 1).toLowerCase();
        if (knownExtensions.includes(extension)) {
            return fileName.slice(0, lastDotIndex); // Remove the extension
        }
    }

    // Return the original file name if no matching extension is found
    return fileName;

}

export const isSelfHosted = () => {
    return process.env.REACT_APP_SELFHOST == undefined || (process.env.REACT_APP_SELFHOST && process.env.REACT_APP_SELFHOST == "true")
}

export const tryCopyToClipboard = async (value) => {
    try {
        await navigator.clipboard.writeText(value);
        console.log("Successfully copied ", value);
        return true
    } catch (error) {
        console.error("Couldn't copy ", value, error);
        return false
    }
}

export function parseTransferExpiryDate(expiresAt) {
    const date = new Date(expiresAt)
    if (date.getTime() == 0) return false
    return date
}

// ChatGPT ;)
export function humanTimeUntil(targetDate) {
    const now = new Date();

    // Calculate the difference in milliseconds
    let diff = targetDate - now;

    if (diff <= 0) {
        return "now";
    }

    // Time calculations for years, days, hours, minutes, and seconds
    const msInSecond = 1000;
    const msInMinute = msInSecond * 60;
    const msInHour = msInMinute * 60;
    const msInDay = msInHour * 24;
    const msInYear = msInDay * 365;  // Approximation, ignoring leap years

    const years = Math.floor(diff / msInYear);
    if (years > 0) {
        const remaining = diff - years * msInYear;
        if (remaining >= msInYear / 2) return `${years + 1}y`;
        return `${years}y`;
    }

    const days = Math.floor(diff / msInDay);
    if (days > 0) {
        const remaining = diff - days * msInDay;
        if (remaining >= msInDay / 2) return `${days + 1}d`;
        return `${days}d`;
    }

    const hours = Math.floor(diff / msInHour);
    if (hours > 0) {
        const remaining = diff - hours * msInHour;
        if (remaining >= msInHour / 2) return `${hours + 1}h`;
        return `${hours}h`;
    }

    const minutes = Math.floor(diff / msInMinute);
    if (minutes > 0) {
        const remaining = diff - minutes * msInMinute;
        if (remaining >= msInMinute / 2) return `${minutes + 1}m`;
        return `${minutes}m`;
    }

    const seconds = Math.floor(diff / msInSecond);
    return `${seconds}s`;
}

export function addSecondsToCurrentDate(seconds) {
    return new Date(Date.now() + (seconds * 1000))
}