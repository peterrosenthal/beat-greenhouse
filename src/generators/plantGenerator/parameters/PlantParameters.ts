import EnvelopeParameters from './EnvelopeParameters';
import AttractionParameters from './AttractionParamters';
import GrowthParameters from './GrowthParameters';
import LeafParameters from './LeafParameters';
import MaterialParameters from './MaterialParameters';

interface PlantParameters {
  envelope: EnvelopeParameters,
  attraction: AttractionParameters,
  growth: GrowthParameters,
  leaves: LeafParameters,
  materials: MaterialParameters,
}

export default PlantParameters;
