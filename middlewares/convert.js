function convertToEmbedUrl(youtubeUrl) {
    let videoId = '';
    // Check for standard and shortened YouTube URLs to extract the video ID
    const standardRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/;
    const shortenedRegex = /(?:https?:\/\/)?youtu\.be\/([^&\s]+)/;
    if (standardRegex.test(youtubeUrl)) {
        const match = youtubeUrl.match(standardRegex);
        if (match && match[1]) {
            videoId = match[1]; // Extract video ID from standard URL
        }
    } else if (shortenedRegex.test(youtubeUrl)) {
        const match = youtubeUrl.match(shortenedRegex);
        if (match && match[1]) {
            videoId = match[1]; // Extract video ID from shortened URL
        }
    }
    // Return the embed URL if a valid video ID is found
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    } else {
        return ''; // Return empty if no valid ID is found
    }
}
// Middleware to convert YouTube URLs to embed format
function convertYoutubeUrlMiddleware(req, res, next) {
    const { videoUrl } = req.body; // Assuming this is where the YouTube URL is coming from
    if (videoUrl) {
        const embedUrl = convertToEmbedUrl(videoUrl); // Convert to embed format
        if (embedUrl) {
            req.body.videoUrl = embedUrl; // Modify the request with the embed URL
            next(); // Continue to the next middleware or route handler
        } else {
            return res.status(400).send("Invalid YouTube URL"); // Bad request if the URL is invalid
        }
    } else {
        next(); // Continue if there's no videoUrl to convert
    }
}

module.exports = {
    convertYoutubeUrlMiddleware
}