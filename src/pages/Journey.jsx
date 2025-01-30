import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// Dance data
const dances = [
  { name: "Bharatanatyam", state: "Tamil Nadu", coords: [10.8505, 78.6921], description: "One of the oldest classical dance forms of India, Bharatanatyam originated in Tamil Nadu. It is known for its grace, purity, tenderness, and sculptures-like poses." },
  { name: "Kathak", state: "Uttar Pradesh", coords: [26.8467, 80.9462], description: "Kathak is one of the major forms of Indian classical dance. The word Kathak is derived from katha, meaning 'the art of storytelling.'" },
  { name: "Odissi", state: "Odisha", coords: [20.9517, 85.0985], description: "Odissi is a major ancient Indian classical dance that originated in the temples of Odisha. It is known for its fluid movements and strong storytelling elements." },
  { name: "Manipuri", state: "Manipur", coords: [24.8170, 93.9368], description: "Manipuri dance is one of the major Indian classical dance forms. It is characterized by gentle, graceful movements and is often performed to narrate scenes from Krishna's life." },
  { name: "Garba", state: "Gujarat", coords: [22.2587, 71.1924], description: "Garba is a traditional folk dance form originating from Gujarat. It is performed during Navratri and involves rhythmic movements in a circular pattern." },
  { name: "Bhangra", state: "Punjab", coords: [31.1471, 75.3412], description: "Bhangra is a lively folk dance from Punjab, traditionally associated with the harvest season. It is known for its energetic moves and vibrant music." }
];

// Events data
const eventsData = {
  bharatanatyam: [
    { 
      id: 1, 
      title: "Classical Night: Bharatanatyam", 
      date: "2025-02-15", 
      venue: "Chennai Music Academy", 
      price: "₹500",
      coords: [13.0327, 80.2707]
    },
    { 
      id: 2, 
      title: "Temple Dance Festival", 
      date: "2025-03-01", 
      venue: "Thanjavur Temple", 
      price: "₹300",
      coords: [10.7870, 79.1378]
    }
  ],
  kathak: [
    { 
      id: 3, 
      title: "Kathak Utsav", 
      date: "2025-02-20", 
      venue: "Lucknow Sangeet Sabha", 
      price: "₹400",
      coords: [26.8467, 80.9462]
    },
    { 
      id: 4, 
      title: "Rhythm & Grace", 
      date: "2025-03-10", 
      venue: "Ghanshyam Auditorium, Varanasi", 
      price: "₹450",
      coords: [25.3176, 82.9739]
    }
  ]
};

export default function Journey() {
  const [selectedDance, setSelectedDance] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    // Initialize map with adjusted zoom level
    const map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: false,  // Disable zoom with mouse wheel
      dragging: true,          // Allow panning
      minZoom: 4,             // Set minimum zoom level
      maxZoom: 8              // Set maximum zoom level
    }).setView([23.5937, 78.9629], 4);  // Centered on India with zoom level 4

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(map);

    // Add dance markers
    dances.forEach(dance => {
      L.marker(dance.coords)
        .addTo(map)
        .bindPopup(`<b>${dance.name}</b><br>${dance.state}`)
        .on('click', () => {
          const danceName = dance.name.toLowerCase();
          setSelectedDance(dance);
          setSelectedEvents(eventsData[danceName] || []);
        });
    });

    // Add event markers
    const eventIcon = L.divIcon({
      className: 'event-marker',
      html: '🎭',
      iconSize: [25, 25]
    });

    Object.values(eventsData).forEach(danceEvents => {
      danceEvents.forEach(event => {
        L.marker(event.coords, { icon: eventIcon })
          .addTo(map)
          .bindPopup(`
            <div class="event-popup">
              <div class="event-title">${event.title}</div>
              <div class="event-date">${formatDate(event.date)}</div>
              <div>${event.venue}</div>
              <div><strong>${event.price}</strong></div>
            </div>
          `);
      });
    });

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 h-screen">
      <h1 className="text-2xl font-bold text-orange-900 mb-6">Dance Map of India</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <div className="lg:col-span-2">
          <div id="map" className="h-full rounded-lg shadow-lg"></div>
        </div>
        <div className="space-y-6 overflow-auto max-h-full">
          <div className="min-h-[100px]">
            {selectedDance ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold text-orange-900">{selectedDance.name}</h3>
                <div className="text-orange-600 font-medium mb-2">{selectedDance.state}</div>
                <p className="text-gray-600">{selectedDance.description}</p>
              </div>
            ) : (
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                Click on a marker to see dance details
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-3">Upcoming Events</h3>
            <div className="space-y-2">
              {selectedDance ? (
                selectedEvents.length > 0 ? (
                  selectedEvents.map(event => (
                    <div key={event.id} className="bg-white p-4 rounded-lg shadow mb-2">
                      <div className="font-bold text-orange-900">{event.title}</div>
                      <div className="text-orange-600">{formatDate(event.date)}</div>
                      <div className="text-gray-600">{event.venue}</div>
                      <div className="font-medium text-orange-600 mt-2">{event.price}</div>
                      <button className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-none w-full mt-2">
                        Book Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    No upcoming events for {selectedDance.name}
                  </div>
                )
              ) : (
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  Select a dance form to see related events
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 