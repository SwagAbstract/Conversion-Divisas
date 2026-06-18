import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [divisas, setDivisas] = useState([]);
  const [cantidad, setCantidad] = useState('');
  const [origen, setOrigen] = useState('USD');
  const [destinos, setDestinos] = useState([]);
  const [resultados, setResultados] = useState(null);

  // Estados para administración (CRUD)
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaTasa, setNuevaTasa] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/divisas';

  // Cargar divisas al iniciar
  useEffect(() => {
    cargarDivisas();
  }, []);

  const cargarDivisas = async () => {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDivisas(data);
    } catch (err) {
      console.error("Error cargando divisas", err);
    } finally {
      setCargando(false);
    }
  };

  // Manejar selección de múltiples Checkboxes
  const handleCheckboxChange = (codigo) => {
    if (destinos.includes(codigo)) {
      setDestinos(destinos.filter(d => d !== codigo));
    } else {
      setDestinos([...destinos, codigo]);
    }
  };

  // Petición de Conversión
  const ejecutarConversion = async (e) => {
    e.preventDefault();
    if (!cantidad || destinos.length === 0) {
      alert("Por favor introduce una cantidad y al menos una moneda de destino.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/convertir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: parseFloat(cantidad), monedaOrigen: origen, monedasDestino: destinos })
      });
      const data = await res.json();
      setResultados(data.conversiones);
    } catch (err) {
      alert("Error al procesar la conversión");
    }
  };

  // Crear Divisa
  const crearDivisa = async (e) => {
    e.preventDefault();
    try {
      const payload = { codigo: nuevoCodigo, nombre: nuevoNombre, tasaRespectoAlDolar: parseFloat(nuevaTasa) };
      
      if (editandoId) {
        await fetch(`${API_URL}/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setEditandoId(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      cargarDivisas();
      setNuevoCodigo(''); setNuevoNombre(''); setNuevaTasa('');
    } catch (err) {
      alert("Error al procesar la divisa");
    }
  };

  const prepararEdicion = (d) => {
    setEditandoId(d._id);
    setNuevoCodigo(d.codigo);
    setNuevoNombre(d.nombre);
    setNuevaTasa(d.tasaRespectoAlDolar);
  };

  // Eliminar Divisa
  const eliminarDivisa = async (id) => {
    if(confirm("¿Seguro que deseas eliminar esta divisa?")) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      cargarDivisas();
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🌐 Conversor de Divisas Pro</h1>
        <p>Solución corporativa de tipo de cambio</p>
      </header>

      {/* SECCIÓN 1: CONVERSOR */}
      <section className="card">
        <h2>Calcular Conversión</h2>
        <form onSubmit={ejecutarConversion}>
          <div className="grid-inputs">
            <div>
              <label>Cantidad (Monto):</label>
              <input type="number" step="any" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label>Moneda Origen:</label>
              <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
                {divisas.map(d => <option key={d._id} value={d.codigo}>{d.codigo} - {d.nombre}</option>)}
              </select>
            </div>
          </div>

          <label style={{ marginTop: '15px', display: 'block' }}>Monedas de Destino (Selecciona varias):</label>
          <div className="checkbox-group">
            {divisas.map(d => (
              <label key={d._id} className="checkbox-label">
                <input type="checkbox" checked={destinos.includes(d.codigo)} onChange={() => handleCheckboxChange(d.codigo)} />
                {d.codigo}
              </label>
            ))}
          </div>

          <button type="submit" className="btn-primary">Convertir Dinero</button>
        </form>

        {resultados && (
          <div className="results">
            <h3>Resultados:</h3>
            <ul>
              {resultados.map((r, idx) => (
                <li key={idx}><strong>{r.valorConvertido} {r.codigo}</strong> — {r.nombre}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* SECCIÓN 2: ADMINISTRADOR CRUD */}
      <section className="card admin-section">
        <h2>Panel de Administración (CRUD)</h2>
        <form onSubmit={crearDivisa} className="admin-form">
          <input type="text" placeholder="CÓDIGO (Ej: COP)" value={nuevoCodigo} onChange={(e) => setNuevoCodigo(e.target.value)} required />
          <input type="text" placeholder="Nombre (Ej: Peso Colombiano)" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required />
          <input type="number" step="any" placeholder="Tasa respecto al USD" value={nuevaTasa} onChange={(e) => setNuevaTasa(e.target.value)} required />
          <button type="submit" className="btn-secondary">
            {editandoId ? 'Actualizar' : 'Agregar'} Moneda
          </button>
          {editandoId && <button type="button" onClick={() => {setEditandoId(null); setNuevoCodigo(''); setNuevoNombre(''); setNuevaTasa('');}}>Cancelar</button>}
        </form>

        <h3>Divisas en el Sistema</h3>
        {cargando && <p>Cargando divisas...</p>}
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tasa Base (1 USD)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {divisas.map(d => (
              <tr key={d._id}>
                <td><strong>{d.codigo}</strong></td>
                <td>{d.nombre}</td>
                <td>{d.tasaRespectoAlDolar}</td>
                <td>
                  <button onClick={() => eliminarDivisa(d._id)} className="btn-danger">Eliminar</button>
                  <button onClick={() => prepararEdicion(d)} className="btn-secondary" style={{marginLeft: '5px', padding: '6px 12px', fontSize: '12px'}}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;