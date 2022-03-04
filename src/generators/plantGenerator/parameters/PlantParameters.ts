import EnvelopeParameters from './EnvelopeParameters';
import AttractionParameters from './AttractionParamters';
import GrowthParameters from './GrowthParameters';
import LeafParameters from './LeafParameters';

interface PlantParameters {
  envelope: EnvelopeParameters,
  attraction: AttractionParameters,
  growth: GrowthParameters,
  leaves: LeafParameters,
}

export default PlantParameters;
