import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import Button from '../ui/Button';

interface TablaDatosProps<T> {
  datos: T[];
  columnas: ColumnDef<T>[];
  filasPorPagina?: number;
}

// Tabla generica del panel: TanStack Table con paginacion del lado del cliente
function TablaDatos<T>({ datos, columnas, filasPorPagina = 10 }: TablaDatosProps<T>) {
  // TanStack Table no es compatible con la memorizacion automatica del React Compiler (aviso esperado)
  // eslint-disable-next-line react-hooks/incompatible-library
  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: filasPorPagina } },
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((encabezado) => (
                  <th key={encabezado.id} className="px-4 py-3">
                    {encabezado.isPlaceholder
                      ? null
                      : flexRender(encabezado.column.columnDef.header, encabezado.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-gray-100 hover:bg-gray-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tabla.getPageCount() > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm text-gray-600">
          <Button variante="secundario" tamanio="sm" onClick={() => tabla.previousPage()} disabled={!tabla.getCanPreviousPage()}>
            ← Anterior
          </Button>
          <span>
            Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()}
          </span>
          <Button variante="secundario" tamanio="sm" onClick={() => tabla.nextPage()} disabled={!tabla.getCanNextPage()}>
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
}

export default TablaDatos;
