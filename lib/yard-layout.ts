// This object defines the precise coordinates for all tracks and labels based on the provided yard image.
export const YARD_LAYOUT = {
    interchanges: [
        { x: 800, y: 330, width: 200, height: 40 },
        { x: 600, y: 430, width: 100, height: 40 },
    ],
    tracks: [
        // Test Track
        { id: "test_track", path: [{ x: 0, y: 780 }, { x: 2000, y: 780 }] },
        // ACWP and connection
        { id: "acwp_main", path: [{ x: 0, y: 100 }, { x: 400, y: 100 }] },
        { id: "acwp_connect", path: [{ x: 400, y: 100 }, { x: 600, y: 100 }, { x: 800, y: 350 }] },
        // Workshop and connections
        { id: "workshop_1", path: [{ x: 100, y: 600 }, { x: 400, y: 600 }] },
        { id: "workshop_2", path: [{ x: 100, y: 630 }, { x: 400, y: 630 }] },
        { id: "workshop_3", path: [{ x: 100, y: 660 }, { x: 400, y: 660 }] },
        { id: "workshop_neck", path: [{ x: 400, y: 630 }, { x: 500, y: 630 }, { x: 600, y: 450 }] },
        // Pit Wheel Lathe
        { id: "pit_lathe", path: [{ x: 100, y: 710 }, { x: 400, y: 710 }] },
        { id: "pit_lathe_neck", path: [{ x: 400, y: 710 }, { x: 500, y: 710 }, { x: 600, y: 450 }] },
        // Main Lines & Shunting Neck
        { id: "main_line_1", path: [{ x: 0, y: 450 }, { x: 600, y: 450 }] },
        { id: "main_line_2", path: [{ x: 700, y: 450 }, { x: 800, y: 350 }, { x: 1000, y: 350 }] },
        // To Inspection Lines
        { id: "shunting_neck_to_ibl", path: [{ x: 1000, y: 350 }, { x: 1050, y: 350 }, { x: 1100, y: 200 }] },
        // Emergency Rerailing Line
        { id: "emergency_rerail", path: [{ x: 1100, y: 200 }, { x: 1200, y: 150 }, { x: 1400, y: 120 }] },
        // To Sidings
        { id: "shunting_neck_to_sidings_1", path: [{ x: 1000, y: 350 }, { x: 1200, y: 350 }, { x: 1450, y: 180 }] },
        { id: "shunting_neck_to_sidings_2", path: [{ x: 1000, y: 350 }, { x: 1200, y: 350 }, { x: 1450, y: 480 }] },
        // Inspection Lines
        { id: "ibl_1", path: [{ x: 1100, y: 200 }, { x: 1110, y: 200 }, { x: 1120, y: 220 }, { x: 1400, y: 220 }] },
        { id: "ibl_2", path: [{ x: 1100, y: 200 }, { x: 1110, y: 200 }, { x: 1120, y: 240 }, { x: 1400, y: 240 }] },
        { id: "ibl_3", path: [{ x: 1100, y: 200 }, { x: 1110, y: 200 }, { x: 1120, y: 260 }, { x: 1400, y: 260 }] },
        { id: "deep_cleaning", path: [{ x: 1100, y: 200 }, { x: 1110, y: 200 }, { x: 1120, y: 280 }, { x: 1400, y: 280 }] },
        // Siding Connectors & Tracks
        ...Array.from({ length: 6 }).map((_, i) => ({ id: `siding_t_${i}`, path: [{ x: 1450, y: 180 }, { x: 1480, y: 180 }, { x: 1500, y: 80 + i * 30 }, { x: 1950, y: 80 + i * 30 }] })),
        ...Array.from({ length: 6 }).map((_, i) => ({ id: `siding_b_${i}`, path: [{ x: 1450, y: 480 }, { x: 1480, y: 480 }, { x: 1500, y: 430 + i * 30 }, { x: 1950, y: 430 + i * 30 }] })),
    ],
    labels: [
        { x: 200, y: 70, text: "ACWP", size: "14px" },
        { x: 250, y: 570, text: "WORKSHOP", size: "14px" },
        { x: 1250, y: 190, text: "INSPECTION BAYS", size: "14px" },
        { x: 1700, y: 50, text: "SIDINGS", size: "14px" },
        { x: 1000, y: 760, text: "TEST TRACK", size: "14px" },
        { x: 450, y: 200, text: "Shunting Neck", size: "10px", fill: "#718096" },
        { x: 450, y: 740, text: "Shunting Neck", size: "10px", fill: "#718096" },
        { x: 1250, y: 100, text: "Emergency Rerailing Line", size: "10px", fill: "#E53E3E" },
    ]
};