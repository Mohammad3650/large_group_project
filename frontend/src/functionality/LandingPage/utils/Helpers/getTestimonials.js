/**
 * Returns the list of student testimonials for the landing page.
 *
 * @returns {Array<{avatar: string, name: string, stars: string, review: string}>} The testimonials array
 */
function getTestimonials() {
    return [
        {
            avatar: 'OK',
            name: 'Omar Kassam',
            stars: '⭐⭐⭐⭐⭐',
            review: '"StudySync helped me actually plan my week instead of just hoping for the best. It\'s simple and clear."'
        },
        {
            avatar: 'IA',
            name: 'Ijaj Ahmed',
            stars: '⭐⭐⭐⭐⭐',
            review: '"I used to miss deadlines all the time. Having everything in one place made a huge difference."'
        },
        {
            avatar: 'HK',
            name: 'Hamza Khan',
            stars: '⭐⭐⭐⭐⭐',
            review: '"Perfect for university life. I like that it focuses on planning, not distractions or unnecessary clutter."'
        },
        {
            avatar: 'MI',
            name: 'Mohammed Islam',
            stars: '⭐⭐⭐⭐⭐',
            review: '"Straightforward, easy to use, and actually helpful. Exactly what I needed as a student."'
        },
        {
            avatar: 'AS',
            name: 'Abdulrahman Sharif',
            stars: '⭐⭐⭐⭐',
            review: '"Using StudySync made my weeks feel more organised, and far less chaotic."'
        },
        {
            avatar: 'NA',
            name: 'Nabil Ahmed',
            stars: '⭐⭐⭐⭐⭐',
            review: '"It\'s really helped me balance lectures, coursework, and revision without feeling overwhelmed."'
        }
    ];
}

export default getTestimonials;