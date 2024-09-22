window.onload = function () {
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([35.2433, 38.9637]),
            zoom: 6
        })
    });

    var addPointMode = false; // Başlangıçta interaktif mod kapalı
    var iconFeatures = []; // Eklenen ikonları saklamak için

    function addIcon(x, y, name, pointId) {
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([x, y])), // Koordinatları LonLat olarak dönüştürün
            name: name,
            id: pointId
        });

        iconFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1], // İkonun alt orta noktasını koordinatlara oturtur
                src: 'assets/icons/maps-and-flags.png', // İkon dosyasının yolu
                scale: 0.08, // İkon boyutu
                imgSize: [512, 512], // Orijinal resim boyutları
            }),
            text: new ol.style.Text({
                text: name,
                offsetY: -25, // Metin ikonun üstünde görünecek şekilde yukarı kaydırılır
                fill: new ol.style.Fill({
                    color: '#000000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#FFFFFF',
                    width: 2
                })
            })
        }));

        vectorSource.addFeature(iconFeature); // Vektör kaynağına özellik ekleyin
        iconFeatures.push(iconFeature); // Array'e ikonu ekleyin
    }

    var vectorSource = new ol.source.Vector(); // İkonlar için kaynak
    var vectorLayer = new ol.layer.Vector({ // İkonları gösterecek katman
        source: vectorSource
    });
    map.addLayer(vectorLayer); // Katmanı haritaya ekleyin

    // Harita yüklendiğinde veritabanındaki noktaları yükle ve haritaya ekle
    fetch('/api/point')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const points = result.data;
                points.forEach(point => {
                    addIcon(point.x, point.y, point.name, point.id); // Haritaya noktaları ekleyin
                });
            } else {
                console.error('Failed to retrieve points: ' + result.message);
            }
        })
        .catch(error => console.error('Error fetching points:', error));

    // Add Point butonuna tıklanıldığında interaktif modu etkinleştir
    document.getElementById('addPoint').addEventListener('click', function () {
        addPointMode = !addPointMode; // Modu aç/kapa
        this.textContent = addPointMode ? "Add Point (Active)" : "Add Point";
        this.style.backgroundColor = addPointMode ? "#90ee90" : "#ffcccb"; // Aktif mod için yeşil arka plan

        if (addPointMode) {
            map.getViewport().style.cursor = 'crosshair'; // İmleci değiştir
            map.once('click', handleMapClick); // Sadece bir kez tıklama olayını dinle
        } else {
            map.getViewport().style.cursor = 'default'; // İmleci varsayılana döndür
        }
    });

    function handleMapClick(event) {
        if (addPointMode) {
            var coordinate = ol.proj.toLonLat(event.coordinate); // Koordinatları alın
            var xCoord = coordinate[0].toFixed(6);
            var yCoord = coordinate[1].toFixed(6);

            jsPanel.create({
                headerTitle: 'Add Point',
                contentSize: '400 200',
                content: `
                <form id="addPointForm">
                    <label for="xCoord">X Coordinate:</label>
                    <input type="text" id="xCoord" name="xCoord" value="${xCoord}" readonly><br>
                    <label for="yCoord">Y Coordinate:</label>
                    <input type="text" id="yCoord" name="yCoord" value="${yCoord}" readonly><br>
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required><br>
                    <button type="submit">Add</button>
                </form>
                `,
                callback: function (panel) {
                    document.getElementById('addPointForm').addEventListener('submit', async function (event) {
                        event.preventDefault();

                        var newPoint = {
                            X: parseFloat(document.getElementById('xCoord').value),
                            Y: parseFloat(document.getElementById('yCoord').value),
                            Name: document.getElementById('name').value
                        };

                        try {
                            const response = await fetch('/api/point', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(newPoint)
                            });

                            const result = await response.json();
                            if (result.success) {
                                alert('Point added successfully!');
                                addIcon(newPoint.X, newPoint.Y, newPoint.Name, result.data.id); // Haritaya ekleyin
                                panel.close(); // Paneli kapat
                            } else {
                                alert('Failed to add point: ' + result.message);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('An error occurred while adding the point.');
                        }
                    });
                }
            });

            addPointMode = false; // Modu kapat
            document.getElementById('addPoint').textContent = "Add Point";
            document.getElementById('addPoint').style.backgroundColor = "#ffcccb"; // Arka planı kırmızıya döndür
            map.getViewport().style.cursor = 'default'; // İmleci varsayılana döndür
        }
    }
   

    // Query butonuna tıklanıldığında
    document.getElementById('query').addEventListener('click', function () {
        jsPanel.create({
            headerTitle: 'Query Points',
            contentSize: '600 400',
            content: `
            <table id="queryTable" class="display">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>X Coordinate</th>
                        <th>Y Coordinate</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="resultsBody">
                    <!-- Veriler buraya eklenecek -->
                </tbody>
            </table>
            `,
            callback: function (panel) {
                // Tablodaki verileri yükle
                fetch('/api/point')
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            const points = result.data;
                            points.forEach(point => {
                                const row = document.createElement('tr');
                                row.innerHTML = `
                                <td>${point.name}</td>
                                <td>${point.x.toFixed(6)}</td>
                                <td>${point.y.toFixed(6)}</td>
                                <td>
                                    <button class="updateBtn" data-id="${point.id}">Update</button>
                                    <button class="deleteBtn" data-id="${point.id}">Delete</button>
                                    <button class="showBtn" data-id="${point.id}">Show</button>
                                </td>
                            `;
                                document.getElementById('resultsBody').appendChild(row);
                            });

                            // DataTables'i başlat
                            $('#queryTable').DataTable();


                            let selectedFeature = null;

                            // Query kısmında update butonlarına tıklanıldığında
                            document.querySelectorAll('.updateBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const pointId = this.getAttribute('data-id');
                                    const point = points.find(p => p.id == pointId);

                                    const panel = jsPanel.create({
                                        headerTitle: 'Update Point',
                                        contentSize: '400 200',
                                        content: `
<button id="dragUpdate">Sürükleyerek Güncelle</button>
<button id="panelUpdate">Panelle Güncelle</button>
<button id="closePanel">Kapat</button>
`,
                                        callback: function (panel) {
                                            document.getElementById('closePanel').addEventListener('click', function () {
                                                panel.close();
                                            });

                                            document.getElementById('dragUpdate').addEventListener('click', function () {
                                                alert('Lütfen güncellemek istediğiniz noktayı harita üzerinde sürükleyin.');
                                                const feature = vectorSource.getFeatures().find(f => f.get('id') == pointId);
                                                if (feature) {
                                                    const dragInteraction = new ol.interaction.Translate({
                                                        features: new ol.Collection([feature])
                                                    });
                                                    map.addInteraction(dragInteraction);

                                                    dragInteraction.on('translateend', async function (event) {
                                                        const coordinates = ol.proj.toLonLat(event.coordinate);
                                                        const updatedPoint = {
                                                            id: pointId,
                                                            newX: parseFloat(coordinates[0].toFixed(6)),
                                                            newY: parseFloat(coordinates[1].toFixed(6)),
                                                            newName: feature.get('name')
                                                        };

                                                        try {
                                                            const response = await fetch(`/api/Point/update`, {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Content-Type': 'application/json'
                                                                },
                                                                body: JSON.stringify(updatedPoint)
                                                            });

                                                            const result = await response.json();
                                                            if (result.success) {
                                                                alert('Point updated successfully!');
                                                                map.removeInteraction(dragInteraction);
                                                                panel.close();
                                                            } else {
                                                                alert('Failed to update point: ' + result.message);
                                                            }
                                                        } catch (error) {
                                                            console.error('Error:', error);
                                                            alert('An error occurred while updating the point.');
                                                        }
                                                    });
                                                }
                                            });

                                            document.getElementById('panelUpdate').addEventListener('click', function () {
                                                panel.content.innerHTML = `
    <form id="updatePointForm">
        <label for="xCoordUpdate">X Coordinate:</label>
        <input type="text" id="xCoordUpdate" name="xCoordUpdate" value="${point.x.toFixed(6)}" required><br>
        <label for="yCoordUpdate">Y Coordinate:</label>
        <input type="text" id="yCoordUpdate" name="yCoordUpdate" value="${point.y.toFixed(6)}" required><br>
        <label for="nameUpdate">Name:</label>
        <input type="text" id="nameUpdate" name="nameUpdate" value="${point.name}" required><br>
        <button type="submit">Update</button>
    </form>
    <button id="closePanel">Kapat</button>
`;

                                                document.getElementById('closePanel').addEventListener('click', function () {
                                                    panel.close();
                                                });

                                                document.getElementById('updatePointForm').addEventListener('submit', async function (event) {
                                                    event.preventDefault();

                                                    var updatedPoint = {
                                                        id: pointId,
                                                        newX: parseFloat(document.getElementById('xCoordUpdate').value),
                                                        newY: parseFloat(document.getElementById('yCoordUpdate').value),
                                                        newName: document.getElementById('nameUpdate').value
                                                    };

                                                    try {
                                                        const response = await fetch(`/api/Point/update`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify(updatedPoint)
                                                        });

                                                        const result = await response.json();
                                                        if (result.success) {
                                                            alert('Point updated successfully!');
                                                            panel.close();
                                                        } else {
                                                            alert('Failed to update point: ' + result.message);
                                                        }
                                                    } catch (error) {
                                                        console.error('Error:', error);
                                                        alert('An error occurred while updating the point.');
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            });











                            

                            // Delete butonlarına tıklanıldığında
                            document.querySelectorAll('.deleteBtn').forEach(button => {
                                button.addEventListener('click', async function () {
                                    const pointId = this.getAttribute('data-id');

                                    try {
                                        const response = await fetch(`/api/Point/delete?id=${pointId}`, {
                                            method: 'DELETE'
                                        });

                                        const result = await response.json();
                                        if (result.success) {
                                            alert('Point deleted successfully!');

                                            // Harita üzerinde ikonu kaldır
                                            const feature = vectorSource.getFeatures().find(f => f.get('id') == pointId);
                                            if (feature) {
                                                vectorSource.removeFeature(feature); // Özelliği kaldır
                                            }

                                            // Tabloyu güncelle
                                            const row = this.closest('tr');
                                            row.remove();

                                        } else {
                                            alert('Failed to delete point: ' + result.message);
                                        }
                                    } catch (error) {
                                        console.error('Error:', error);
                                        alert('An error occurred while deleting the point.');
                                    }
                                });
                            }); 




                            // Show butonlarına tıklanıldığında
                            document.querySelectorAll('.showBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const pointId = this.getAttribute('data-id');
                                    const point = points.find(p => p.id == pointId);

                                    map.getView().animate({
                                        center: ol.proj.fromLonLat([point.x, point.y]),
                                        zoom: 12,
                                        duration: 1000
                                    });
                                });
                            });

                        } else {
                            console.error('Failed to retrieve points: ' + result.message);
                        }
                    })
                    .catch(error => console.error('Error fetching points:', error));
            }
        });
    });
    


    // Harita üzerindeki ikonlara tıklama olayı
    map.on('click', function (event) {
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
            var coordinate = ol.proj.toLonLat(feature.getGeometry().getCoordinates());
            var xCoord = coordinate[0].toFixed(6);
            var yCoord = coordinate[1].toFixed(6);
            var name = feature.get('name');
            var pointId = feature.get('id');

            jsPanel.create({
                headerTitle: 'Point Details',
                contentSize: '400 200',
                content: `
                <p><strong>ID:</strong> ${pointId}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>X Coordinate:</strong> ${xCoord}</p>
                <p><strong>Y Coordinate:</strong> ${yCoord}</p>
                <button id="deletePoint">Delete Point</button>
                `,
                callback: function (panel) {
                    // Delete Point butonuna tıklanıldığında
                    document.getElementById('deletePoint').addEventListener('click', async function () {
                        try {
                            const response = await fetch(`/api/Point/delete?id=${pointId}`, {
                                method: 'DELETE'
                            });

                            const result = await response.json();
                            if (result.success) {
                                alert('Point deleted successfully!');
                                vectorSource.removeFeature(feature); // Özelliği kaldır
                                panel.close(); // Paneli kapat
                            } else {
                                alert('Failed to delete point: ' + result.message);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('An error occurred while deleting the point.');
                        }
                    });
                }
            });
        });
    });
};
