interface GoogleMapProps {
  latitude: number;
  longitude: number;
  name?: string;
}

export default function GoogleMap({ latitude, longitude, name = "Location" }: GoogleMapProps) {
  const mapQuery = encodeURIComponent(`${latitude},${longitude}`);
  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=m&z=14&output=embed&iwloc=near`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        title={`Map showing location of ${name}`}
        src={embedUrl}
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
