document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a');
    const externalLinkPattern = /^(https?:\/\/|www\.)/;
    const internalLinkPattern = new RegExp(`^https?://${window.location.hostname}`);
    const modalButton = document.querySelector('.link-modal-opener');
    const currentDomain = window.location.hostname;
    let externalLink = '';

    links.forEach(link => {
        const linkDomain = new URL(link.href).hostname;
        if (linkDomain && linkDomain !== currentDomain) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            link.addEventListener('click', function(clickEvent) { 
                clickEvent.preventDefault();
                const modalLinkPreview = document.querySelector('#danger-link');

                externalLink = link.href;
                modalLinkPreview.textContent = externalLink;

                modalButton.style.display = 'block';
                modalButton.click();
                modalButton.style.display = 'none';
            });
        }
    });

    document.addEventListener('modal-action', function() {
        if (externalLink) {
            window.open(externalLink, '_blank');
        }
    });
});