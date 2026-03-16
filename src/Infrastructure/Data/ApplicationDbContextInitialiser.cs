using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Enums;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public ApplicationDbContextInitialiser(ILogger<ApplicationDbContextInitialiser> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task TrySeedAsync()
    {
        if (_context.Hotels.Any()) return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yearStart = new DateOnly(today.Year, 1, 1);
        var yearEnd = new DateOnly(today.Year, 12, 31);

        var hotels = new[]
        {
            CreateHotel(
                "Hotel Volcan de San Salvador",
                "Hotel urbano con vista al volcan, cocina salvadorena contemporanea y espacios para viajes de negocios y descanso.",
                "85 Avenida La Revolucion, Colonia San Benito",
                "San Salvador",
                "El Salvador",
                "reservas@hotelvolcan.com",
                "+50321132001",
                5),
            CreateHotel(
                "Hotel Costa del Sol Pacifico",
                "Resort frente al mar ideal para fines de semana familiares, bodas y vacaciones en la costa salvadorena.",
                "Km 67 Boulevard Costa del Sol",
                "La Paz",
                "El Salvador",
                "hola@costadelsolpacifico.com",
                "+50321132002",
                4),
            CreateHotel(
                "Posada Ruta de Las Flores",
                "Posada boutique rodeada de cafe, artesanias y clima fresco en una de las rutas turisticas mas queridas del pais.",
                "4 Calle Oriente, Barrio El Calvario",
                "Juayua",
                "El Salvador",
                "reservas@posadarutadelasflores.com",
                "+50321132003",
                4),
            CreateHotel(
                "Suites Lago de Coatepeque",
                "Suites relajadas con terrazas privadas, embarcadero y acceso rapido a miradores del lago.",
                "Canton Potrerios, orilla sur del lago",
                "Santa Ana",
                "El Salvador",
                "info@lago-coatepeque.com",
                "+50321132004",
                4),
            CreateHotel(
                "Hotel Antigua Casona",
                "Casco historico, patios coloniales y servicio enfocado en escapadas romanticas y turismo cultural.",
                "6a Avenida Norte 14",
                "Antigua Guatemala",
                "Guatemala",
                "reservas@antiguacasona.com",
                "+50223172005",
                5),
            CreateHotel(
                "Hotel Bahia de Tela",
                "Hotel caribeno con ambiente tranquilo, mariscos frescos y facil acceso a playas y reservas naturales.",
                "Barrio El Centro, frente a la bahia",
                "Tela",
                "Honduras",
                "info@bahiadetela.com",
                "+50422162006",
                4),
            CreateHotel(
                "Hotel Granada Colonial",
                "Hospedaje colonial cerca del malecon con piscina interior y experiencias gastronomicas nicaraguenses.",
                "Calle La Calzada 210",
                "Granada",
                "Nicaragua",
                "reservas@granadacolonial.com",
                "+50522542007",
                4),
            CreateHotel(
                "Hotel Bosque Nuboso Monteverde",
                "Refugio de montana para ecoturismo con senderos, observacion de aves y desayunos de productos locales.",
                "Ruta a Reserva Monteverde, Santa Elena",
                "Monteverde",
                "Costa Rica",
                "hola@bosquenubosomonteverde.com",
                "+50625092008",
                5),
            CreateHotel(
                "Hotel Casco Viejo Istmeno",
                "Hotel de ciudad en barrio historico, perfecto para trabajo remoto y escapadas cortas en Panama.",
                "Calle 11 Este, Casco Viejo",
                "Ciudad de Panama",
                "Panama",
                "reservas@istmeno.com",
                "+50731042009",
                5),
            CreateHotel(
                "Hotel Puerto de La Libertad",
                "Hotel costero enfocado en surf, escapadas de fin de semana y cocina marina salvadorena.",
                "Malecon turistico, Puerto de La Libertad",
                "La Libertad",
                "El Salvador",
                "reservas@puertodelalibertad.com",
                "+50321132010",
                4),
            CreateHotel(
                "Hotel Cerro Verde Mirador",
                "Hotel de montana con clima fresco, senderos y vistas al volcan de Izalco y al lago de Coatepeque.",
                "Parque Natural Cerro Verde",
                "Santa Ana",
                "El Salvador",
                "hola@cerroverdemirador.com",
                "+50321132011",
                4),
            CreateHotel(
                "Hotel Paseo El Carmen",
                "Hotel boutique en zona gastronomica y cultural, ideal para eventos y escapadas urbanas.",
                "7a Avenida Sur, Paseo El Carmen",
                "Santa Tecla",
                "El Salvador",
                "reservas@paseoelcarmenhotel.com",
                "+50321132012",
                4),
            CreateHotel(
                "Hotel Bahia de Jiquilisco",
                "Refugio ecoturistico con tours de manglar, observacion de aves y ambiente relajado.",
                "Isla de Mendez, Bahia de Jiquilisco",
                "Usulutan",
                "El Salvador",
                "info@bahiadejiquilisco.com",
                "+50321132013",
                4),
            CreateHotel(
                "Hotel Suchitlan Colonial",
                "Hospedaje tranquilo cerca del lago Suchitlan con enfoque en arte, historia y descanso.",
                "Avenida 15 de Septiembre",
                "Suchitoto",
                "El Salvador",
                "reservas@suchitlancolonial.com",
                "+50321132014",
                3),
            CreateHotel(
                "Hotel Copan Ruinas Plaza",
                "Hotel acogedor para rutas arqueologicas y turismo cultural en occidente hondureno.",
                "Avenida Centroamerica, Copan Ruinas",
                "Copan Ruinas",
                "Honduras",
                "hola@copanruinasplaza.com",
                "+50422162015",
                4),
            CreateHotel(
                "Hotel Leon Solar",
                "Hotel de ciudad con patios frescos y cercania a catedrales, arte y vida nocturna de Leon.",
                "2da Avenida NE",
                "Leon",
                "Nicaragua",
                "reservas@leonsolar.com",
                "+50522542016",
                4),
            CreateHotel(
                "Hotel Bocas del Toro Azul",
                "Hotel isleño para descanso tropical, buceo y trabajo remoto frente al mar.",
                "Avenida Norte, Isla Colon",
                "Bocas del Toro",
                "Panama",
                "reservas@bocasazul.com",
                "+50731042017",
                4),
            CreateHotel(
                "Hotel Valle de Anton Jardin",
                "Hotel rodeado de montanas con spa, senderismo y ambiente de descanso total.",
                "Calle Principal, El Valle de Anton",
                "El Valle de Anton",
                "Panama",
                "hola@valledeantonjardin.com",
                "+50731042018",
                5),
            CreateHotel(
                "Hotel Quetzaltenango Centro",
                "Hotel urbano para viajes de negocio y turismo en el altiplano guatemalteco.",
                "14 Avenida, Zona 1",
                "Quetzaltenango",
                "Guatemala",
                "reservas@quetzaltenangocentro.com",
                "+50223172019",
                4),
            CreateHotel(
                "Hotel Atitlan Brisa",
                "Hotel con vistas al lago, jardines amplios y experiencias de descanso alrededor de Atitlan.",
                "Panajachel, Calle Santander",
                "Panajachel",
                "Guatemala",
                "info@atitlanbrisa.com",
                "+50223172020",
                5),
            CreateHotel(
                "Hotel Manuel Antonio Senderos",
                "Hotel vacacional cerca del parque nacional con enfoque en naturaleza y playa.",
                "Quepos, ruta a Manuel Antonio",
                "Quepos",
                "Costa Rica",
                "reservas@senderosma.com",
                "+50625092021",
                5),
            CreateHotel(
                "Hotel San Jose Sabana",
                "Hotel corporativo moderno con salones para reuniones y acceso rapido a la ciudad.",
                "Boulevard de Rohrmoser",
                "San Jose",
                "Costa Rica",
                "hola@sabanahotelcr.com",
                "+50625092022",
                4),
            CreateHotel(
                "Hotel Caye Caulker Arena",
                "Hotel relajado para estancias caribenas con muelle, bicicletas y ambiente juvenil.",
                "Front Street, Caye Caulker",
                "Caye Caulker",
                "Belice",
                "reservas@cayecaulkerarena.com",
                "+5012233023",
                4),
            CreateHotel(
                "Hotel San Ignacio Rio",
                "Hotel de aventura cerca de cuevas, rios y excursiones arqueologicas en Belice occidental.",
                "Bullet Tree Road",
                "San Ignacio",
                "Belice",
                "info@sanignaciorio.com",
                "+5012233024",
                5)
        };

        _context.Hotels.AddRange(hotels);
        await _context.SaveChangesAsync();

        var hotelByName = hotels.ToDictionary(h => h.Name);

        var roomTypes = new[]
        {
            CreateRoomType(hotelByName["Hotel Volcan de San Salvador"], "Habitacion Estandar Ejecutiva", "Cama queen, escritorio ergonomico y cafe local de cortesia.", 2, 119m),
            CreateRoomType(hotelByName["Hotel Volcan de San Salvador"], "Suite Panorama", "Suite amplia con sala pequena, vista a la ciudad y acceso al lounge.", 3, 189m),
            CreateRoomType(hotelByName["Hotel Volcan de San Salvador"], "Suite Presidencial Cuscatlan", "Terraza privada, comedor y servicio preferencial para estancias premium.", 5, 329m),

            CreateRoomType(hotelByName["Hotel Costa del Sol Pacifico"], "Habitacion Jardin", "Habitacion comoda cerca de la piscina y areas verdes.", 2, 109m),
            CreateRoomType(hotelByName["Hotel Costa del Sol Pacifico"], "Habitacion Familiar Playa", "Dos camas dobles y balcon para viajes con ninos.", 4, 169m),
            CreateRoomType(hotelByName["Hotel Costa del Sol Pacifico"], "Villa Pacifico", "Villa con kitchenette y acceso rapido a la playa.", 6, 259m),

            CreateRoomType(hotelByName["Posada Ruta de Las Flores"], "Habitacion Cafe", "Espacio acogedor con decoracion artesanal y desayuno tipico.", 2, 79m),
            CreateRoomType(hotelByName["Posada Ruta de Las Flores"], "Habitacion Jardin de Balsamo", "Balcon con vista a huertos y cafe recien tostado.", 3, 99m),
            CreateRoomType(hotelByName["Posada Ruta de Las Flores"], "Suite Familiar Juayua", "Suite de dos ambientes para familias pequenas o grupos de amigos.", 5, 139m),

            CreateRoomType(hotelByName["Suites Lago de Coatepeque"], "Suite Vista Lago", "Terraza con hamaca y vista directa al lago.", 2, 149m),
            CreateRoomType(hotelByName["Suites Lago de Coatepeque"], "Bungalow Mirador", "Bungalow independiente con muelle compartido.", 4, 199m),
            CreateRoomType(hotelByName["Suites Lago de Coatepeque"], "Residencia Familiar Coatepeque", "Espacio amplio para grupos, ideal para celebraciones.", 6, 289m),

            CreateRoomType(hotelByName["Hotel Antigua Casona"], "Habitacion Colonial", "Techos altos, patio interior y amenidades premium.", 2, 159m),
            CreateRoomType(hotelByName["Hotel Antigua Casona"], "Junior Suite Antigua", "Sala pequena y vista a calles empedradas.", 3, 219m),
            CreateRoomType(hotelByName["Hotel Antigua Casona"], "Suite de Patio", "Suite elegante para escapadas especiales con tina amplia.", 4, 309m),

            CreateRoomType(hotelByName["Hotel Bahia de Tela"], "Habitacion Caribe", "Decoracion fresca y acceso facil a la playa.", 2, 94m),
            CreateRoomType(hotelByName["Hotel Bahia de Tela"], "Habitacion Familiar Garifuna", "Espacio funcional para familias con vista parcial al mar.", 4, 144m),
            CreateRoomType(hotelByName["Hotel Bahia de Tela"], "Suite Bahia", "Suite con balcon, sala y desayuno premium.", 4, 214m),

            CreateRoomType(hotelByName["Hotel Granada Colonial"], "Habitacion Patio", "Habitacion tradicional alrededor del patio central.", 2, 89m),
            CreateRoomType(hotelByName["Hotel Granada Colonial"], "Suite La Calzada", "Suite con balcon y detalles coloniales.", 3, 139m),
            CreateRoomType(hotelByName["Hotel Granada Colonial"], "Habitacion Familiar Granada", "Configuracion flexible para familias y grupos pequenos.", 5, 179m),

            CreateRoomType(hotelByName["Hotel Bosque Nuboso Monteverde"], "Cabina Sendero", "Cabina de montana con manta termica y vista al bosque.", 2, 129m),
            CreateRoomType(hotelByName["Hotel Bosque Nuboso Monteverde"], "Suite Colibri", "Suite con ventanales grandes y desayuno organico.", 3, 179m),
            CreateRoomType(hotelByName["Hotel Bosque Nuboso Monteverde"], "Cabina Familiar Neblina", "Cabina amplia para familias aventureras.", 5, 229m),

            CreateRoomType(hotelByName["Hotel Casco Viejo Istmeno"], "Habitacion Urbana", "Habitacion moderna para estancias cortas en el centro historico.", 2, 149m),
            CreateRoomType(hotelByName["Hotel Casco Viejo Istmeno"], "Suite Balcon Colonial", "Balcon privado y zona de trabajo para nómadas digitales.", 3, 209m),
            CreateRoomType(hotelByName["Hotel Casco Viejo Istmeno"], "Suite Istmeno", "Suite premium con sala, comedor y servicio VIP.", 5, 319m),

            CreateRoomType(hotelByName["Hotel Puerto de La Libertad"], "Habitacion Surf", "Habitacion practica con balcon y espacio para tablas.", 2, 99m),
            CreateRoomType(hotelByName["Hotel Cerro Verde Mirador"], "Cabana Volcan", "Cabana de montana con vista al bosque y clima fresco.", 4, 139m),
            CreateRoomType(hotelByName["Hotel Paseo El Carmen"], "Habitacion Urbana Teclena", "Habitacion moderna para escapadas urbanas y gastronomicas.", 2, 109m),
            CreateRoomType(hotelByName["Hotel Bahia de Jiquilisco"], "Eco Suite Manglar", "Suite serena para ecoturismo y descanso frente al manglar.", 3, 129m),
            CreateRoomType(hotelByName["Hotel Suchitlan Colonial"], "Habitacion Patio Suchitlan", "Habitacion sencilla con patio colonial y desayuno local.", 2, 85m),
            CreateRoomType(hotelByName["Hotel Copan Ruinas Plaza"], "Habitacion Arqueologica", "Habitacion comoda para rutas culturales y familiares.", 3, 115m),
            CreateRoomType(hotelByName["Hotel Leon Solar"], "Habitacion Patio Leon", "Espacio fresco con detalles coloniales y descanso urbano.", 2, 95m),
            CreateRoomType(hotelByName["Hotel Bocas del Toro Azul"], "Suite Isla Azul", "Suite tropical con balcon y acceso rapido al muelle.", 3, 155m),
            CreateRoomType(hotelByName["Hotel Valle de Anton Jardin"], "Suite Termal", "Suite relajante cerca de jardines, spa y senderos.", 2, 175m),
            CreateRoomType(hotelByName["Hotel Quetzaltenango Centro"], "Habitacion Altiplano", "Habitacion ejecutiva para estancias de trabajo y descanso.", 2, 105m),
            CreateRoomType(hotelByName["Hotel Atitlan Brisa"], "Suite Lago Atitlan", "Suite panoramica con terraza y vista al lago.", 4, 195m),
            CreateRoomType(hotelByName["Hotel Manuel Antonio Senderos"], "Habitacion Selva Playa", "Habitacion comoda para vacaciones cerca del parque nacional.", 3, 165m),
            CreateRoomType(hotelByName["Hotel San Jose Sabana"], "Habitacion Ejecutiva Sabana", "Habitacion de negocios con escritorio amplio y desayuno incluido.", 2, 125m),
            CreateRoomType(hotelByName["Hotel Caye Caulker Arena"], "Habitacion Brisa Caribe", "Habitacion relajada con hamaca y estilo isleño.", 2, 145m),
            CreateRoomType(hotelByName["Hotel San Ignacio Rio"], "Suite Aventura Maya", "Suite para excursiones de aventura con terraza y vista al rio.", 4, 185m)
        };

        _context.RoomTypes.AddRange(roomTypes);
        await _context.SaveChangesAsync();

        var ratePlans = new List<RatePlan>();
        foreach (var roomType in roomTypes)
        {
            ratePlans.Add(CreateRatePlan(
                roomType,
                "Tarifa Flexible",
                $"Tarifa base flexible para {roomType.Name.ToLowerInvariant()}.",
                yearStart,
                yearEnd,
                roomType.BasePrice));

            ratePlans.Add(CreateRatePlan(
                roomType,
                roomType.MaxOccupancy >= 5 ? "Plan Familiar Centroamericano" : "Reserva Anticipada",
                roomType.MaxOccupancy >= 5
                    ? "Descuento para grupos y familias que reservan varias noches."
                    : "Descuento para reservas realizadas con anticipacion.",
                yearStart,
                yearEnd,
                roomType.BasePrice,
                roomType.MaxOccupancy >= 5 ? 15m : 10m));

            if (roomType.BasePrice >= 180m)
            {
                ratePlans.Add(CreateRatePlan(
                    roomType,
                    "Escapada de Fin de Semana",
                    "Tarifa especial para escapadas de viernes a domingo.",
                    yearStart,
                    yearEnd,
                    roomType.BasePrice,
                    12m));
            }
            else
            {
                ratePlans.Add(CreateRatePlan(
                    roomType,
                    "Estadia Prolongada",
                    "Tarifa preferencial para estancias de 5 noches o mas.",
                    yearStart,
                    yearEnd,
                    roomType.BasePrice,
                    18m));
            }
        }

        _context.RatePlans.AddRange(ratePlans);
        await _context.SaveChangesAsync();

        var roomCapacities = new Dictionary<string, int>
        {
            ["Habitacion Estandar Ejecutiva"] = 28,
            ["Suite Panorama"] = 12,
            ["Suite Presidencial Cuscatlan"] = 4,
            ["Habitacion Jardin"] = 20,
            ["Habitacion Familiar Playa"] = 16,
            ["Villa Pacifico"] = 8,
            ["Habitacion Cafe"] = 14,
            ["Habitacion Jardin de Balsamo"] = 10,
            ["Suite Familiar Juayua"] = 6,
            ["Suite Vista Lago"] = 12,
            ["Bungalow Mirador"] = 9,
            ["Residencia Familiar Coatepeque"] = 5,
            ["Habitacion Colonial"] = 18,
            ["Junior Suite Antigua"] = 10,
            ["Suite de Patio"] = 7,
            ["Habitacion Caribe"] = 16,
            ["Habitacion Familiar Garifuna"] = 10,
            ["Suite Bahia"] = 7,
            ["Habitacion Patio"] = 14,
            ["Suite La Calzada"] = 9,
            ["Habitacion Familiar Granada"] = 8,
            ["Cabina Sendero"] = 15,
            ["Suite Colibri"] = 8,
            ["Cabina Familiar Neblina"] = 6,
            ["Habitacion Urbana"] = 22,
            ["Suite Balcon Colonial"] = 11,
            ["Suite Istmeno"] = 5,
            ["Habitacion Surf"] = 18,
            ["Cabana Volcan"] = 10,
            ["Habitacion Urbana Teclena"] = 16,
            ["Eco Suite Manglar"] = 9,
            ["Habitacion Patio Suchitlan"] = 12,
            ["Habitacion Arqueologica"] = 14,
            ["Habitacion Patio Leon"] = 15,
            ["Suite Isla Azul"] = 8,
            ["Suite Termal"] = 9,
            ["Habitacion Altiplano"] = 18,
            ["Suite Lago Atitlan"] = 10,
            ["Habitacion Selva Playa"] = 14,
            ["Habitacion Ejecutiva Sabana"] = 20,
            ["Habitacion Brisa Caribe"] = 11,
            ["Suite Aventura Maya"] = 9
        };

        var inventoryRecords = new List<RoomInventory>();
        for (var i = 0; i < 120; i++)
        {
            var date = today.AddDays(i);
            foreach (var roomType in roomTypes)
            {
                var totalRooms = roomCapacities[roomType.Name];
                var heldRooms = GetHeldRooms(date, totalRooms, roomType.MaxOccupancy);

                inventoryRecords.Add(new RoomInventory
                {
                    RoomTypeId = roomType.Id,
                    Date = date,
                    TotalRooms = totalRooms,
                    AvailableRooms = totalRooms - heldRooms
                });
            }
        }

        _context.RoomInventories.AddRange(inventoryRecords);
        await _context.SaveChangesAsync();

        var guests = new[]
        {
            CreateGuest("Ana Lucia", "Hernandez", "ana.hernandez@correo.com", "+50370100101", "DUI", "04651234-5", new DateOnly(1991, 5, 14), "Salvadorena"),
            CreateGuest("Carlos Ernesto", "Mejia", "carlos.mejia@correo.com", "+50370100102", "DUI", "03874562-1", new DateOnly(1988, 8, 2), "Salvadoreno"),
            CreateGuest("Maria Fernanda", "Lopez", "maria.lopez@correo.com", "+50370100103", "Pasaporte", "ES451209", new DateOnly(1995, 11, 21), "Salvadorena"),
            CreateGuest("Jose Roberto", "Castro", "jose.castro@correo.com", "+50370100104", "Pasaporte", "GT802114", new DateOnly(1983, 2, 10), "Guatemalteco"),
            CreateGuest("Daniela", "Pineda", "daniela.pineda@correo.com", "+50499881234", "Pasaporte", "HN771920", new DateOnly(1994, 7, 30), "Hondurena"),
            CreateGuest("Luis Alfredo", "Morales", "luis.morales@correo.com", "+50587654321", "Cedula", "001-220790-1002A", new DateOnly(1990, 7, 22), "Nicaraguense"),
            CreateGuest("Gabriela", "Arias", "gabriela.arias@correo.com", "+50688112233", "Pasaporte", "CR663520", new DateOnly(1987, 9, 8), "Costarricense"),
            CreateGuest("Ricardo", "Guardado", "ricardo.guardado@correo.com", "+50370100105", "DUI", "02991473-8", new DateOnly(1979, 1, 18), "Salvadoreno"),
            CreateGuest("Valeria", "Sanchez", "valeria.sanchez@correo.com", "+50765554433", "Pasaporte", "PA552001", new DateOnly(1998, 4, 5), "Panamena"),
            CreateGuest("Paola", "Recinos", "paola.recinos@correo.com", "+50255112233", "Pasaporte", "GT440221", new DateOnly(1992, 12, 19), "Guatemalteca"),
            CreateGuest("Jorge Alberto", "Mena", "jorge.mena@correo.com", "+50370100106", "DUI", "01884566-7", new DateOnly(1985, 10, 11), "Salvadoreno"),
            CreateGuest("Sofia Elena", "Cruz", "sofia.cruz@correo.com", "+50370100107", "DUI", "04219876-2", new DateOnly(1996, 6, 27), "Salvadorena")
        };

        _context.Guests.AddRange(guests);
        await _context.SaveChangesAsync();

        var guestByEmail = guests.ToDictionary(g => g.Email);

        var adminUser = CreateUser("admin@hotelbooking.local", "Plataforma", "Administracion", UserRole.Admin, "Admin123!");
        var customerUser = CreateUser("cliente@hotelbooking.local", "Marvin", "Alas", UserRole.Customer, "Guest123!");
        var secondCustomerUser = CreateUser("turismo@hotelbooking.local", "Camila", "Ayala", UserRole.Customer, "Guest123!");
        var corporateCustomerUser = CreateUser("empresas@hotelbooking.local", "Rafael", "Escobar", UserRole.Customer, "Guest123!");

        _context.Users.AddRange(adminUser, customerUser, secondCustomerUser, corporateCustomerUser);
        await _context.SaveChangesAsync();

        var roomTypeByName = roomTypes.ToDictionary(rt => rt.Name);

        var bookings = new List<Booking>
        {
            CreateBooking("BK-2026-0001", customerUser.Id, guestByEmail["ana.hernandez@correo.com"].Id, roomTypeByName["Habitacion Estandar Ejecutiva"].Id, today.AddDays(5), today.AddDays(8), 2, 1, 357m, "Piso alto y check-in temprano si esta disponible."),
            CreateBooking("BK-2026-0002", customerUser.Id, guestByEmail["carlos.mejia@correo.com"].Id, roomTypeByName["Habitacion Familiar Playa"].Id, today.AddDays(9), today.AddDays(12), 4, 1, 507m, "Habitacion cerca de la piscina para ninos."),
            CreateBooking("BK-2026-0003", secondCustomerUser.Id, guestByEmail["maria.lopez@correo.com"].Id, roomTypeByName["Habitacion Cafe"].Id, today.AddDays(12), today.AddDays(15), 2, 1, 237m),
            CreateBooking("BK-2026-0004", secondCustomerUser.Id, guestByEmail["jose.castro@correo.com"].Id, roomTypeByName["Suite Vista Lago"].Id, today.AddDays(18), today.AddDays(21), 2, 1, 447m, "Solicita cena romantica el segundo dia."),
            CreateBooking("BK-2026-0005", corporateCustomerUser.Id, guestByEmail["daniela.pineda@correo.com"].Id, roomTypeByName["Junior Suite Antigua"].Id, today.AddDays(22), today.AddDays(26), 2, 1, 876m, "Necesita factura a nombre de empresa."),
            CreateBooking("BK-2026-0006", corporateCustomerUser.Id, guestByEmail["luis.morales@correo.com"].Id, roomTypeByName["Suite Bahia"].Id, today.AddDays(25), today.AddDays(29), 2, 1, 856m),
            CreateBooking("BK-2026-0007", adminUser.Id, guestByEmail["gabriela.arias@correo.com"].Id, roomTypeByName["Cabina Sendero"].Id, today.AddDays(30), today.AddDays(34), 2, 1, 516m, "Llegada tardia despues de las 9 pm."),
            CreateBooking("BK-2026-0008", secondCustomerUser.Id, guestByEmail["ricardo.guardado@correo.com"].Id, roomTypeByName["Habitacion Urbana"].Id, today.AddDays(7), today.AddDays(10), 1, 1, 447m),
            CreateBooking("BK-2026-0009", customerUser.Id, guestByEmail["valeria.sanchez@correo.com"].Id, roomTypeByName["Suite Balcon Colonial"].Id, today.AddDays(14), today.AddDays(17), 2, 1, 627m),
            CreateBooking("BK-2026-0010", corporateCustomerUser.Id, guestByEmail["paola.recinos@correo.com"].Id, roomTypeByName["Villa Pacifico"].Id, today.AddDays(40), today.AddDays(44), 5, 1, 1036m, "Celebracion familiar con decoracion sencilla."),
            CreateBooking("BK-2026-0011", customerUser.Id, guestByEmail["jorge.mena@correo.com"].Id, roomTypeByName["Residencia Familiar Coatepeque"].Id, today.AddDays(45), today.AddDays(48), 6, 1, 867m),
            CreateBooking("BK-2026-0012", secondCustomerUser.Id, guestByEmail["sofia.cruz@correo.com"].Id, roomTypeByName["Suite Istmeno"].Id, today.AddDays(52), today.AddDays(55), 2, 1, 957m, "Necesita transporte desde el aeropuerto.")
        };

        bookings[0].Confirm();
        bookings[1].Confirm();
        bookings[3].Confirm();
        bookings[4].Confirm();
        bookings[5].Confirm();
        bookings[6].Confirm();
        bookings[7].Confirm();
        bookings[8].Confirm();
        bookings[9].Confirm();
        bookings[10].Confirm();
        bookings[10].Cancel("Cambio de planes del grupo.");

        _context.Bookings.AddRange(bookings);
        await _context.SaveChangesAsync();

        var bookingByNumber = bookings.ToDictionary(b => b.BookingNumber);

        var payments = new[]
        {
            CreatePayment(bookingByNumber["BK-2026-0001"].Id, "TXN-20260001", 357m, PaymentMethod.CreditCard, PaymentStatus.Captured, DateTimeOffset.UtcNow.AddDays(-2)),
            CreatePayment(bookingByNumber["BK-2026-0002"].Id, "TXN-20260002", 507m, PaymentMethod.DebitCard, PaymentStatus.Captured, DateTimeOffset.UtcNow.AddDays(-1)),
            CreatePayment(bookingByNumber["BK-2026-0004"].Id, "TXN-20260003", 447m, PaymentMethod.CreditCard, PaymentStatus.Authorized, DateTimeOffset.UtcNow.AddHours(-18)),
            CreatePayment(bookingByNumber["BK-2026-0005"].Id, "TXN-20260004", 876m, PaymentMethod.BankTransfer, PaymentStatus.Authorized, DateTimeOffset.UtcNow.AddHours(-12)),
            CreatePayment(bookingByNumber["BK-2026-0006"].Id, "TXN-20260005", 856m, PaymentMethod.CreditCard, PaymentStatus.Captured, DateTimeOffset.UtcNow.AddHours(-6)),
            CreatePayment(bookingByNumber["BK-2026-0007"].Id, "TXN-20260006", 516m, PaymentMethod.PayPal, PaymentStatus.Captured, DateTimeOffset.UtcNow.AddHours(-4)),
            CreatePayment(bookingByNumber["BK-2026-0009"].Id, "TXN-20260007", 627m, PaymentMethod.CreditCard, PaymentStatus.Failed, DateTimeOffset.UtcNow.AddHours(-2), "Banco emisor rechazo la transaccion."),
            CreatePayment(bookingByNumber["BK-2026-0011"].Id, "TXN-20260008", 867m, PaymentMethod.BankTransfer, PaymentStatus.Cancelled, DateTimeOffset.UtcNow.AddHours(-1), "Reserva cancelada por el cliente."),
            CreatePayment(bookingByNumber["BK-2026-0012"].Id, "TXN-20260009", 957m, PaymentMethod.CreditCard, PaymentStatus.Pending, null)
        };

        _context.Payments.AddRange(payments);
        await _context.SaveChangesAsync();
    }

    private static Hotel CreateHotel(
        string name,
        string description,
        string address,
        string city,
        string country,
        string email,
        string phoneNumber,
        int starRating)
    {
        return new Hotel
        {
            Name = name,
            Description = description,
            Address = address,
            City = city,
            Country = country,
            Email = email,
            PhoneNumber = phoneNumber,
            StarRating = starRating,
            IsActive = true
        };
    }

    private static RoomType CreateRoomType(Hotel hotel, string name, string description, int maxOccupancy, decimal basePrice)
    {
        return new RoomType
        {
            HotelId = hotel.Id,
            Name = name,
            Description = description,
            MaxOccupancy = maxOccupancy,
            BasePrice = basePrice,
            IsActive = true
        };
    }

    private static RatePlan CreateRatePlan(
        RoomType roomType,
        string name,
        string description,
        DateOnly validFrom,
        DateOnly validTo,
        decimal pricePerNight,
        decimal? discountPercentage = null)
    {
        return new RatePlan
        {
            RoomTypeId = roomType.Id,
            Name = name,
            Description = description,
            ValidFrom = validFrom,
            ValidTo = validTo,
            PricePerNight = pricePerNight,
            DiscountPercentage = discountPercentage,
            IsActive = true
        };
    }

    private static Guest CreateGuest(
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        string documentType,
        string documentNumber,
        DateOnly dateOfBirth,
        string nationality)
    {
        return new Guest
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = phoneNumber,
            DocumentType = documentType,
            DocumentNumber = documentNumber,
            DateOfBirth = dateOfBirth,
            Nationality = nationality
        };
    }

    private User CreateUser(string email, string firstName, string lastName, UserRole role, string password)
    {
        var user = new User
        {
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            FirstName = firstName,
            LastName = lastName,
            Role = role,
            IsActive = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, password);
        return user;
    }

    private static Booking CreateBooking(
        string bookingNumber,
        int userId,
        int guestId,
        int roomTypeId,
        DateOnly checkInDate,
        DateOnly checkOutDate,
        int numberOfGuests,
        int numberOfRooms,
        decimal totalAmount,
        string? specialRequests = null)
    {
        return Booking.Create(
            bookingNumber,
            userId,
            guestId,
            roomTypeId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            numberOfRooms,
            totalAmount,
            DateOnly.MinValue,
            specialRequests);
    }

    private static Payment CreatePayment(
        int bookingId,
        string transactionId,
        decimal amount,
        PaymentMethod paymentMethod,
        PaymentStatus status,
        DateTimeOffset? processedAt,
        string? failureReason = null)
    {
        return new Payment
        {
            BookingId = bookingId,
            TransactionId = transactionId,
            Amount = amount,
            Currency = "USD",
            PaymentMethod = paymentMethod,
            Status = status,
            ProcessedAt = processedAt,
            FailureReason = failureReason
        };
    }

    private static int GetHeldRooms(DateOnly date, int totalRooms, int maxOccupancy)
    {
        var seasonalBase = date.Month switch
        {
            3 or 4 or 8 => Math.Max(1, totalRooms / 5),
            11 or 12 => Math.Max(1, totalRooms / 4),
            _ => Math.Max(1, totalRooms / 8)
        };

        var weekendBoost = date.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday
            ? Math.Max(1, totalRooms / 10)
            : 0;

        var familyBoost = maxOccupancy >= 5 && date.DayOfWeek == DayOfWeek.Sunday
            ? 1
            : 0;

        return Math.Min(totalRooms - 1, seasonalBase + weekendBoost + familyBoost);
    }
}
