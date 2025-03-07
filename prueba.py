import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect("piezas.db")
cursor = conn.cursor()

# Ver las tablas disponibles
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tablas = cursor.fetchall()
print("📌 Tablas en la base de datos:", tablas)

# Ver datos de la tabla "pedido"
cursor.execute("SELECT * FROM pedido;")
pedidos = cursor.fetchall()

print("\n🔍 Datos en la tabla 'pedido':")
for pedido in pedidos:
    print(pedido)

# Cerrar conexión
conn.close()
