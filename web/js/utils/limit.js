export function attachLengthLimit(inputElement, limitElement, maxLength = 1000) {
    if (!inputElement || !limitElement) return () => {};

    const progressSpan = limitElement.querySelector("span");

    const updateProgress = () => {
        const currentLength = inputElement.value.trim().length;
        const percentage = Math.min((currentLength * 100) / maxLength, 100);

        if (progressSpan) {
            progressSpan.style.width = `${percentage}%`;
            progressSpan.style.backgroundColor = percentage > 90 ? "var(--pink)" : "var(--blue)";
        }
    };

    inputElement.addEventListener("input", updateProgress);

    return updateProgress;
}
