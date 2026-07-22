# IMAGE R3 — Inventario Final de Imágenes

## Fotos por técnica (nuevas de Karla)

| Técnica | Cantidad | Archivos |
|---|---|---|
| balayage | 6 | kaba_balayage_01.webp, kaba_balayage_02.webp, kaba_balayage_03.webp, kaba_balayage_04.webp, kaba_balayage_05.webp, kaba_balayage_06.webp |
| babylights | 3 | kaba_babylights_01.webp, kaba_babylights_02.webp, kaba_babylights_03.webp |
| bloque | 6 | kaba_bloque_01.webp, kaba_bloque_02.webp, kaba_bloque_03.webp, kaba_bloque_04.webp, kaba_bloque_05.webp, kaba_bloque_06.webp |
| contorno | 3 | kaba_contorno_01.webp, kaba_contorno_02.webp, kaba_contorno_03.webp |
| decoloracion_global | 5 | kaba_decoloracion_global_01.webp, kaba_decoloracion_global_02.webp, kaba_decoloracion_global_03.webp, kaba_decoloracion_global_04.webp, kaba_decoloracion_global_05.webp |
| visos_gorro | 3 | kaba_visos_gorro_01.webp, kaba_visos_gorro_02.webp, kaba_visos_gorro_03.webp |
| tintes | 6 | kaba_tintes_01.webp, kaba_tintes_02.webp, kaba_tintes_03.webp, kaba_tintes_04.webp, kaba_tintes_05.webp, kaba_tintes_06.webp |

**Subtotal fotos nuevas: 32**

## Destacados (Instagram antiguos, movidos a `img/destacados/`)

| Cantidad | Archivos |
|---|---|
| 12 | kaba_Amo_cuando_se_van_como_unas_Barbie.webp, kaba_Amooo.webp, kaba_aprovechando_ratito.webp, kaba_balayage_2.webp, kaba_Bello_balayage.webp, kaba_Bello_cambio_peluqueria.webp, kaba_Bendiciones_pa_too_el_mundo.webp, kaba_Chao_canas_hola_luz_Mechas_dorad.webp, kaba_correccion_color.webp, kaba_El_amor_propio_es_el_comienzo_de_t.webp, kaba_Un_cabello_que_impacta_no_solo.webp, kaba_Un_detalle_exclusivo_para_una_perso.webp |

## Assets adicionales conservados (en `img/`)

| Archivo | Uso |
|---|---|
| hero.webp | Hero del sitio |
| about.webp | Sección about |
| service1.webp | Servicio 1 |
| service2.webp | Servicio 2 |

## Resumen

| Categoría | Cantidad |
|---|---|
| Fotos nuevas procesadas | 32 |
| Destacados (Instagram) | 12 |
| Assets adicionales | 4 |
| **Fotos totales** | **48** |
| **Videos** | **3** |

## Videos (en `img/video/`)

| Archivo | Tamaño | Thumbnail |
|---|---|---|
| kaba_video_01.mp4 | 2.2 MB | kaba_video_01_thumb.webp (640×1138) |
| kaba_video_02.mp4 | 0.5 MB | kaba_video_02_thumb.webp (640×1144) |
| kaba_video_03.mp4 | 2.3 MB | kaba_video_03_thumb.webp (640×1138) |

**Peso total imágenes:** 6.3 MB (WebP)
**Peso total videos:** 5.0 MB (MP4 H.264)

## Pipeline aplicado

1. **Conversión:** JPEG → WebP calidad 85%-30% según necesidad
2. **Resolución:** 1200px ancho (hasta 850px en casos extremos)
3. **Brillo/Saturación:** +10% brillo, +20% saturación (`-modulate 110,120,100`)
4. **Sharpening:** `-sharpen 0x1`
5. **Tamaño máximo:** < 200KB por imagen
6. **Videos:** Re-encode H.264 CRF 28 + AAC 64k, poster frames extraídos
