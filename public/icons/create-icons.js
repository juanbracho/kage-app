// Simple icon creation script for PWA
// This creates data URIs for basic icons

const iconSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// Create a simple SVG data URI for each size
iconSizes.forEach(size => {
    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#FF7101"/>
            <circle cx="${size/2}" cy="${size/2}" r="${size/2 * 0.8}" fill="white"/>
            <text x="${size/2}" y="${size/2 + size/8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size/8}" font-weight="bold" fill="#FF7101">K</text>
        </svg>
    `;
    
    const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
    console.log(`Icon ${size}x${size}: ${dataUri}`);
});

// Export for use in the app
export const iconDataUris = {
    72: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjM2IiBjeT0iMzYiIHI9IjM2IiBmaWxsPSIjRkY3MTAxIi8+CiAgICA8Y2lyY2xlIGN4PSIzNiIgY3k9IjM2IiByPSIyOC44IiBmaWxsPSJ3aGl0ZSIvPgogICAgPHRleHQgeD0iMzYiIHk9IjQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOSIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRjcxMDEiPks8L3RleHQ+Cjwvc3ZnPg==',
    96: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjQ4IiBjeT0iNDgiIHI9IjQ4IiBmaWxsPSIjRkY3MTAxIi8+CiAgICA8Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSIzOC40IiBmaWxsPSJ3aGl0ZSIvPgogICAgPHRleHQgeD0iNDgiIHk9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkY3MTAxIj5LPC90ZXh0Pgo8L3N2Zz4=',
    128: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2NCIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNTEuMiIgZmlsbD0id2hpdGUiLz4KICAgIDx0ZXh0IHg9IjY0IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGNzEwMSI+SzwvdGV4dD4KPC9zdmc+',
    144: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0IiBoZWlnaHQ9IjE0NCIgdmlld0JveD0iMCAwIDE0NCAxNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSI3MiIgY3k9IjcyIiByPSI3MiIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iNzIiIGN5PSI3MiIgcj0iNTcuNiIgZmlsbD0id2hpdGUiLz4KICAgIDx0ZXh0IHg9IjcyIiB5PSI5MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGNzEwMSI+SzwvdGV4dD4KPC9zdmc+',
    152: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUyIiBoZWlnaHQ9IjE1MiIgdmlld0JveD0iMCAwIDE1MiAxNTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSI3NiIgY3k9Ijc2IiByPSI3NiIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iNzYiIGN5PSI3NiIgcj0iNjAuOCIgZmlsbD0id2hpdGUiLz4KICAgIDx0ZXh0IHg9Ijc2IiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE5IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGNzEwMSI+SzwvdGV4dD4KPC9zdmc+',
    180: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE4MCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSI5MCIgY3k9IjkwIiByPSI5MCIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iOTAiIGN5PSI5MCIgcj0iNzIiIGZpbGw9IndoaXRlIi8+CiAgICA8dGV4dCB4PSI5MCIgeT0iMTEyLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMi41IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGNzEwMSI+SzwvdGV4dD4KPC9zdmc+',
    192: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI5NiIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iNzYuOCIgZmlsbD0id2hpdGUiLz4KICAgIDx0ZXh0IHg9Ijk2IiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRjcxMDEiPks8L3RleHQ+Cjwvc3ZnPg==',
    384: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzg0IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDM4NCAzODQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSIxOTIiIGN5PSIxOTIiIHI9IjE5MiIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iMTkyIiBjeT0iMTkyIiByPSIxNTMuNiIgZmlsbD0id2hpdGUiLz4KICAgIDx0ZXh0IHg9IjE5MiIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkY3MTAxIj5LPC90ZXh0Pgo8L3N2Zz4=',
    512: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0iI0ZGNzEwMSIvPgogICAgPGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIyMDQuOCIgZmlsbD0id2hpdGUiLz4KICAgIDx0ZXh0IHg9IjI1NiIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkY3MTAxIj5LPC90ZXh0Pgo8L3N2Zz4='
};

console.log('Icon data URIs generated successfully!');