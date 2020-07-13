export const displayMap = (locations) => {
	mapboxgl.accessToken =
		'pk.eyJ1IjoiaXlsYWpvdmljIiwiYSI6ImNrY2RtaGJhbTAxMGgydHBsMmlzaHJieDEifQ.Ympq-lQnUHdjMUJvgxIAjQ'

	var map = new mapboxgl.Map({
		//- a instrução abaixo inclui o mapa no elemento de id map (container:'map') que é um div comum já criado no html
		container: 'map',
		style: 'mapbox://styles/iylajovic/ckcdnk1m504rt1is5xpzgzmz0',
		scrollZoom: false,
		// center: [-118.444547, 34.009861],
		// zoom: 4,
		//interactive: false
	})

	const bounds = new mapboxgl.LngLatBounds()

	locations.forEach((loc) => {
		const marker = document.createElement('div')
		marker.className = 'marker'

		// Adicionando marcadores
		new mapboxgl.Marker({
			element: marker,
			anchor: 'bottom',
		})
			.setLngLat(loc.coordinates)
			.addTo(map)

		// Adiciona popup
		new mapboxgl.Popup({
			offset: 35,
		})
			.setLngLat(loc.coordinates)
			.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
			.addTo(map)

		// Inclui essa coordenada no enquadramento do mapa
		bounds.extend(loc.coordinates)
	})

	// Enquadrando o mapa
	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 150,
			right: 100,
			left: 100,
		},
	})

}

