export default function Stream({ file }) {
    return (
        <div>
            <h1>Stream File</h1>
            <video controls width="600">
                <source src={`/api/file/download?file=${file}`} type="video/mp4" />
            </video>
        </div>
    );
} 