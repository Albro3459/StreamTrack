using AutoMapper;

using API.Models;
using API.DTOs;

public class StreamingProfile : Profile {
    public StreamingProfile() {
        CreateMap<StreamingService, StreamingServiceDTO>().ReverseMap();

        CreateMap<StreamingOption, StreamingOptionDTO>().ReverseMap();
    }
}