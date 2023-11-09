var contact_map;

ymaps.ready(function(){
	contact_map = new ymaps.Map("map", {
        center: [55.77468032, 37.63081004],
        zoom: 5,
        controls: []
    });	
	
	//contact labels
	myPlacemark = new ymaps.Placemark([55.77475379, 37.63076726], {
		balloonContent: '<span class="balloon__title">Москва</span><span class="balloon__desc">ул. 3-я Парковая. 14а</span><span class="balloon__phone">(499) 367-1000</span>'
	}, {
		iconLayout: 'default#image', 
		iconImageHref: 'img/map-marker.png',
		iconImageSize: [31, 48],
		iconImageOffset: [-15, -48]
	});
	// contact_map.controls.add('zoomControl');	

	
	contact_map.geoObjects.add(myPlacemark);		
	
});