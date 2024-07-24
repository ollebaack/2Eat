
window.initializeCarousel = (carouselId) =>
    {
        const myCarouselElement = document.querySelector('#'+carouselId);

        const carousel = new bootstrap.Carousel(myCarouselElement, {
            interval: 2000,
            touch: true
        });

        // $('#'+carouselId).carousel({interval: 2000});
    
        // //see step 2 to understand these news id's:
        // $('#'+carouselId+'-prev').click ( 
        //         () => $('#'+carouselId).carousel('prev') );
        // $('#'+carouselId+'-next').click ( 
        //         () => $('#'+carouselId).carousel('next') );
    
    }