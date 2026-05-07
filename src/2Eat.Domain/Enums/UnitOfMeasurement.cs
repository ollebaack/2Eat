using System.Text.Json.Serialization;

namespace _2Eat.Domain.Enums
{
    public enum UnitOfMeasurement
    {
        g,
        ml,
        kg,

        krm,
        tsk,
        msk,
        dl,
        l,

        kaffemått,

        st,

        // International units
        cup,

        [JsonStringEnumMemberName("fl oz")]
        floz,

        oz,
        lbs,
        cl,
        pinch,
        tsp,
        tbsp
    }
}
