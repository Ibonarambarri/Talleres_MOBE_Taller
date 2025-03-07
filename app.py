from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Configuración de la aplicación Flask
app = Flask(__name__)

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Obtiene la ruta de la carpeta del proyecto
db_path = os.path.join(BASE_DIR, "piezas.db")  # Guarda la base de datos en la misma carpeta del proyecto

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar la base de datos
db = SQLAlchemy(app)

# Modelo para Cliente
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referencia = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    referencia_nombre = db.Column(db.String(100), nullable=False)
    pedidos = db.relationship('Pedido', backref='cliente', lazy=True)

# Modelo para Pedido
class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero_pedido = db.Column(db.String(50), unique=True, nullable=False)
    fecha = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    prioridad = db.Column(db.Integer, nullable=False, default=4)  # Nivel de prioridad 1-4
    completado = db.Column(db.Boolean, default=False)  # Se actualiza cuando todas las piezas están completadas
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    piezas = db.relationship('Pieza', backref='pedido', lazy=True)

# Modelo para Pieza
class Pieza(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referencia = db.Column(db.String(50), unique=True, nullable=False)  # Ejemplo: AA0001_F
    material = db.Column(db.String(50), nullable=False)
    espesor = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(50), nullable=False)  # Ejemplo: 1004
    punzado = db.Column(db.Boolean, default=False)
    falseo = db.Column(db.Boolean, default=False)
    desarrollo = db.Column(db.Float, nullable=False)  # En mm
    longitud = db.Column(db.Float, nullable=False)  # En mm
    numero_piezas = db.Column(db.Integer, nullable=False)
    total_metros = db.Column(db.Float, nullable=False)  # Calculado: (longitud * numero_piezas) / 1000
    estado_produccion = db.Column(db.String(50), nullable=False)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "referencia": self.referencia,
            "material": self.material,
            "espesor": self.espesor,
            "color": self.color,
            "punzado": self.punzado,
            "falseo": self.falseo,
            "desarrollo": self.desarrollo,
            "longitud": self.longitud,
            "numero_piezas": self.numero_piezas,
            "total_metros": self.total_metros,
            "estado_produccion": self.estado_produccion,
            "pedido_id": self.pedido_id
        }

# Ruta principal para mostrar la página y pedidos no completados
@app.route('/')


def inicio():
    pedidos_pendientes = Pedido.query.filter_by(completado=False).order_by(Pedido.prioridad.asc()).all()

    pedidos_con_piezas = []
    for pedido in pedidos_pendientes:
        piezas = Pieza.query.filter_by(pedido_id=pedido.id).all()
        pedidos_con_piezas.append({
            "numero_pedido": pedido.numero_pedido,
            "fecha": pedido.fecha.strftime("%Y-%m-%d"),
            "prioridad": pedido.prioridad,
            "completado": pedido.completado,
            "piezas": [pieza.to_dict() for pieza in piezas]
        })

    return render_template('index.html', pedidos=pedidos_con_piezas)


# Función para inicializar la base de datos (solo ejecutar una vez)
def crear_db():
    with app.app_context():
        with app.app_context():
            db.create_all()
            print("✅ Base de datos creada con tablas Cliente, Pedido y Pieza.")

@app.route('/buscar', methods=['GET'])
def buscar_piezas():
    ref_pedido = request.args.get('refPedido', '')
    ref_pieza = request.args.get('refPieza', '')
    fecha_inicio = request.args.get('fechaInicio', '')
    fecha_fin = request.args.get('fechaFin', '')
    material = request.args.get('material', '')
    espesor = request.args.get('espesor', '')
    color = request.args.get('color', '')
    estado = request.args.get('estado', '')

    query = Pieza.query.join(Pedido).filter(Pedido.completado == False)

    if ref_pedido:
        query = query.filter(Pedido.numero_pedido.ilike(f"%{ref_pedido}%"))
    if ref_pieza:
        query = query.filter(Pieza.referencia.ilike(f"%{ref_pieza}%"))
    if fecha_inicio:
        query = query.filter(Pedido.fecha >= datetime.strptime(fecha_inicio, '%Y-%m-%d'))
    if fecha_fin:
        query = query.filter(Pedido.fecha <= datetime.strptime(fecha_fin, '%Y-%m-%d'))
    if material:
        query = query.filter(Pieza.material == material)
    if espesor:
        query = query.filter(Pieza.espesor == float(espesor))
    if color:
        query = query.filter(Pieza.color == color)
    if estado:
        query = query.filter(Pieza.estado_produccion == estado)

    piezas_filtradas = query.all()

    resultado = [{
        "id": pieza.id,  # <- Asegúrate de que está esta línea
        "ref_pieza": pieza.referencia,
        "ref_pedido": pieza.pedido.numero_pedido,
        "fecha": pieza.pedido.fecha.strftime('%Y-%m-%d'),
        "material": pieza.material,
        "espesor": pieza.espesor,
        "color": pieza.color,
        "estado": pieza.estado_produccion
    } for pieza in piezas_filtradas]

    return jsonify(resultado)


@app.route('/actualizar_estado/<int:pieza_id>', methods=['POST'])
def actualizar_estado(pieza_id):
    print(f"🔍 Recibiendo solicitud para actualizar pieza con ID: {pieza_id}")

    data = request.get_json()
    nuevo_estado = data.get('estado')

    if not nuevo_estado:
        return jsonify({"error": "No se proporcionó un nuevo estado"}), 400

    pieza = Pieza.query.get(pieza_id)
    if pieza:
        pieza.estado_produccion = nuevo_estado
        db.session.commit()
        print(f"✅ Estado de la pieza {pieza_id} actualizado a: {nuevo_estado}")
        return jsonify({"mensaje": "Estado actualizado correctamente"}), 200

    print(f"❌ Error: No se encontró la pieza con ID {pieza_id}")
    return jsonify({"error": "Pieza no encontrada"}), 404

@app.route('/pieza/<int:pieza_id>')
def obtener_pieza(pieza_id):
    pieza = Pieza.query.get(pieza_id)
    if pieza:
        return jsonify({
            "id": pieza.id,
            "referencia": pieza.referencia,
            "ref_pedido": pieza.pedido.numero_pedido,
            "fecha": pieza.pedido.fecha.strftime('%Y-%m-%d'),
            "material": pieza.material,
            "espesor": pieza.espesor,
            "color": pieza.color,
            "estado_produccion": pieza.estado_produccion
        })
    return jsonify({"error": "Pieza no encontrada"}), 404

# Ejecutar la aplicación
if __name__ == '__main__':
    crear_db()  # Asegura que la base de datos exista antes de iniciar
    app.run(host='0.0.0.0', port=5000, debug=True)
