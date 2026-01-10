export const propertiesData = [
    { id: 1, name: 'Sunset Villa', location: 'Nouakchott', status: 'Published', price: 1500, image: 'https://placehold.co/50x50' },
    { id: 2, name: 'Ocean View Hotel', location: 'Tevregh Zeyna', status: 'Published', price: 2500, image: 'https://placehold.co/50x50' },
    { id: 3, name: 'Desert Camp', location: 'Atar', status: 'Draft', price: 800, image: 'https://placehold.co/50x50' },
    { id: 4, name: 'City Center Inn', location: 'Nouadhibou', status: 'Published', price: 1200, image: 'https://placehold.co/50x50' },
    { id: 5, name: 'Oasis Resort', location: 'Chinguetti', status: 'Published', price: 3000, image: 'https://placehold.co/50x50' }
];

export const reservationsData = [
    { id: 101, propertyId: 1, guestName: 'Ahmed Mohamed', checkIn: '2026-01-10', checkOut: '2026-01-15', status: 'Confirmed', total: 7500 },
    { id: 102, propertyId: 2, guestName: 'Sarah Smith', checkIn: '2026-01-12', checkOut: '2026-01-14', status: 'Pending', total: 5000 },
    { id: 103, propertyId: 1, guestName: 'John Doe', checkIn: '2026-01-20', checkOut: '2026-01-25', status: 'Confirmed', total: 7500 },
    { id: 104, propertyId: 4, guestName: 'Fatima Ali', checkIn: '2026-02-01', checkOut: '2026-02-05', status: 'Cancelled', total: 4800 },
    { id: 105, propertyId: 5, guestName: 'Tourist Group A', checkIn: '2026-01-15', checkOut: '2026-01-18', status: 'Confirmed', total: 9000 }
];

export const reviewsData = [
    { id: 1, propertyId: 1, user: 'Alice Johnson', rating: 5, comment: 'Absolutely amazing stay! The view was breathtaking.', date: '2025-12-20' },
    { id: 2, propertyId: 2, user: 'Bob Smith', rating: 4, comment: 'Great location, but the wifi was a bit slow.', date: '2025-12-22' },
    { id: 3, propertyId: 1, user: 'Charlie Brown', rating: 5, comment: 'Staff was very friendly and helpful. Highly recommended.', date: '2025-12-25' },
    { id: 4, propertyId: 3, user: 'David Wilson', rating: 3, comment: 'It was okay, but a bit pricey for what you get.', date: '2026-01-02' },
    { id: 5, propertyId: 4, user: 'Eva Green', rating: 4, comment: 'Clean rooms and good breakfast.', date: '2026-01-05' }
];

export const messagesData = [
    {
        id: 1,
        sender: 'John Doe',
        avatar: 'https://placehold.co/40x40',
        subject: 'Inquiry about Sunset Villa',
        preview: 'Hi, is the villa available for...',
        date: '10:30 AM',
        read: false,
        messages: [
            { sender: 'John Doe', text: 'Hi, is the villa available for the weekend of Jan 20th?', time: '10:30 AM', isMe: false },
            { sender: 'Me', text: 'Hello John, yes it is available. Would you like to book?', time: '10:35 AM', isMe: true }
        ]
    },
    {
        id: 2,
        sender: 'Sarah Connor',
        avatar: 'https://placehold.co/40x40',
        subject: 'Late Check-in',
        preview: 'I will be arriving late around...',
        date: 'Yesterday',
        read: true,
        messages: [
            { sender: 'Sarah Connor', text: 'I will be arriving late around 11 PM. Is that okay?', time: 'Yesterday', isMe: false }
        ]
    },
    {
        id: 3,
        sender: 'Mike Ross',
        avatar: 'https://placehold.co/40x40',
        subject: 'Parking question',
        preview: 'Do you have free parking?',
        date: 'Jan 5',
        read: true,
        messages: [
            { sender: 'Mike Ross', text: 'Do you have free parking at the Ocean View Hotel?', time: 'Jan 5', isMe: false }
        ]
    }
];

export const paymentsData = [
    { id: 1, propertyId: 1, guest: 'Ahmed Mohamed', amount: 7500, date: '2026-01-10', status: 'Completed', method: 'Credit Card' },
    { id: 2, propertyId: 2, guest: 'Sarah Smith', amount: 5000, date: '2026-01-12', status: 'Pending', method: 'Bank Transfer' },
    { id: 3, propertyId: 1, guest: 'John Doe', amount: 7500, date: '2026-01-20', status: 'Completed', method: 'PayPal' },
    { id: 4, propertyId: 5, guest: 'Tourist Group A', amount: 9000, date: '2026-01-15', status: 'Completed', method: 'Credit Card' },
    { id: 5, propertyId: 4, guest: 'Fatima Ali', amount: 4800, date: '2026-02-01', status: 'Refunded', method: 'Credit Card' }
];
