let chart; // Variable global para almacenar el gráfico

async function obtenerDatos(genero, anio) {
    try {
        // Obtener datos desde la API
        const response = await fetch("https://www.datos.gov.co/resource/gh4e-xuyg.json");
        const data = await response.json();

        // Filtrar por año y género
        const filtro = data.filter(item => {
            const añoDelHecho = new Date(item.fecha_del_hecho).getFullYear();
            return añoDelHecho.toString() === anio.toString() && item.genero === genero;
        });

        if (filtro.length === 0) {
            alert(`No se encontraron datos para ${genero} en ${anio}`);
            return null;
        }

        // Métodos posibles (manteniendo el orden)
        const metodosPosibles = ["Ahorcamiento", "Arma de Fuego", "Corte", "Intoxicación", "Lanzamiento al Vacío", "Otros medios"];
        const conteoMetodos = {};

        // Inicializar conteo en 0 para todos los métodos
        metodosPosibles.forEach(metodo => conteoMetodos[metodo] = 0);

        // Contar los métodos que aparecen en los datos
        filtro.forEach(item => {
            const metodo = item.mecanismo_muerte;

            // Si el método es "otro medios", lo mapeamos a "Otros medios"
            if (metodo === "Otro Medios") {
                conteoMetodos["Otros medios"]++;
            }
            else if (metodosPosibles.includes(metodo)) {
                conteoMetodos[metodo]++;
            }
        });

        return {
            categorias: metodosPosibles,
            valores: metodosPosibles.map(metodo => conteoMetodos[metodo]) // Manteniendo el orden
        };
    } catch (error) {
        console.error("Error al obtener los datos:", error);
    }
}

async function actualizarGrafico() {
    const genero = document.getElementById("genero").value;
    const anio = document.getElementById("anio").value;

    if (!genero || !anio) {
        alert("Por favor, ingrese el género y el año.");
        return;
    }

    const datos = await obtenerDatos(genero, anio);
    if (!datos) return;

    // Destruir el gráfico anterior si existe
    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById("graficoBarras").getContext("2d");
    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: datos.categorias,
            datasets: [{
                label: `Métodos de suicidio en ${genero} (${anio})`, // Etiqueta del dataset
                data: datos.valores,
                backgroundColor: ["blue", "green", "red", "purple", "orange", "brown"]
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: `Métodos utilizados por el género ${genero} en ${anio}`,
                    font: {
                        size: 24
                    },
                    padding: {
                        top: 70,
                        bottom: 20
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw}`;
                        }
                    }
                },
                legend: {
                    display: false // Oculta la leyenda para que no aparezca el recuadro
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Cantidad de casos" // Etiqueta del eje Y
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Métodos" // Etiqueta del eje X
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}